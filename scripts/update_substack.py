#!/usr/bin/env python3
"""Refresh the homepage Substack cards from the Sendfull RSS feed.

Rewrites only the region between the SUBSTACK markers in index.html, and
writes each cover to assets/substack-ep-<n>.jpg (the same files the cards
already use). Cover bytes are the 960px JPEG Substack's image CDN returns
for that post. If the rendered page and those files are already current,
nothing is written.
"""

from __future__ import annotations

import re
import struct
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import escape
from pathlib import Path
from urllib.parse import quote, urlparse
from xml.etree import ElementTree

FEED_URL = "https://sendfull.substack.com/feed"
CARD_COUNT = 3
USER_AGENT = "sendfull-website-substack-sync/1.0 (+https://sendfull.com)"
MAX_BYTES = 8 * 1024 * 1024
COVER_WIDTH = 960

ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = ROOT / "index.html"
ASSETS_DIR = ROOT / "assets"

START = "<!-- SUBSTACK:START -->"
END = "<!-- SUBSTACK:END -->"
POSTS_OPEN = '<div class="_newsletterPosts_1r3da_50" data-visible="false">'
INDENT_DIV = "            "
INDENT_CARD = "              "
INDENT_CHILD = "                "

MONTHS = (
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
)
EPISODE_RE = re.compile(
    r"^\s*ep\.?\s*(\d+)\s*[\.\:\-\u2013\u2014]\s*(.+?)\s*$",
    re.IGNORECASE,
)
IMG_SRC_RE = re.compile(r"""<img\b[^>]*?\bsrc=["']([^"']+)["']""", re.IGNORECASE)
CONTENT_NS = "{http://purl.org/rss/1.0/modules/content/}"

ALLOWED_LINK_HOST = "sendfull.substack.com"
ALLOWED_IMAGE_HOSTS = (
    "substackcdn.com",
    "substack-post-media.s3.amazonaws.com",
)


class UpdateError(Exception):
    """The feed or the homepage could not be updated safely."""


def die(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def fetch(url: str, accept: str | None = None) -> bytes:
    headers = {"User-Agent": USER_AGENT}
    if accept:
        headers["Accept"] = accept
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            chunks: list[bytes] = []
            total = 0
            while True:
                chunk = response.read(64 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_BYTES:
                    raise UpdateError(f"response exceeded {MAX_BYTES} bytes: {url}")
                chunks.append(chunk)
    except urllib.error.HTTPError as exc:
        raise UpdateError(f"HTTP {exc.code} for {url}") from exc
    except urllib.error.URLError as exc:
        raise UpdateError(f"could not fetch {url}: {exc.reason}") from exc
    return b"".join(chunks)


def https_host(url: str) -> str | None:
    parts = urlparse(url.strip())
    if parts.scheme != "https" or not parts.hostname:
        return None
    return parts.hostname.lower()


def cover_source(enclosure_url: str) -> str:
    """Return the underlying image URL, percent-encoded once."""
    marker = "/image/fetch/"
    index = enclosure_url.find(marker)
    if index != -1:
        rest = enclosure_url[index + len(marker) :]
        lowered = rest.lower()
        for prefix in ("https%3a", "http%3a"):
            found = lowered.find(prefix)
            if found != -1:
                return rest[found:]
        for prefix in ("https://", "http://"):
            found = rest.find(prefix)
            if found != -1:
                return quote(rest[found:], safe="")
    return quote(enclosure_url, safe="")


def resized_cover_url(enclosure_url: str) -> str:
    source = cover_source(enclosure_url)
    return (
        "https://substackcdn.com/image/fetch/"
        f"w_{COVER_WIDTH},c_limit,f_jpg,q_auto:good/{source}"
    )


def jpeg_size(data: bytes) -> tuple[int, int]:
    if len(data) < 4 or data[:2] != b"\xff\xd8":
        raise UpdateError("cover is not a JPEG")
    index = 2
    length = len(data)
    while index + 9 < length:
        if data[index] != 0xFF:
            index += 1
            continue
        marker = data[index + 1]
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack(">HH", data[index + 5 : index + 9])
            if width <= 0 or height <= 0:
                raise UpdateError("cover JPEG has an empty size")
            return width, height
        if marker in (0xD8, 0xD9) or marker == 0x01 or 0xD0 <= marker <= 0xD7:
            index += 2
            continue
        if index + 4 > length:
            break
        segment = struct.unpack(">H", data[index + 2 : index + 4])[0]
        if segment < 2:
            break
        index += 2 + segment
    raise UpdateError("could not read the cover JPEG size")


def write_if_changed(path: Path, data: bytes) -> bool:
    if path.is_file() and path.read_bytes() == data:
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    try:
        temporary.write_bytes(data)
        temporary.replace(path)
    finally:
        if temporary.exists():
            temporary.unlink()
    return True


def parse_published(value: str) -> datetime:
    parsed = parsedate_to_datetime(value)
    if parsed is None:
        raise UpdateError(f"unreadable pubDate: {value}")
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def item_image_url(item: ElementTree.Element) -> str | None:
    enclosure = item.find("enclosure")
    if enclosure is not None:
        url = (enclosure.get("url") or "").strip()
        kind = (enclosure.get("type") or "").lower()
        host = https_host(url)
        if url and host in ALLOWED_IMAGE_HOSTS and (
            kind.startswith("image/") or kind == ""
        ):
            return url
    encoded = item.findtext(f"{CONTENT_NS}encoded") or ""
    for match in IMG_SRC_RE.finditer(encoded):
        url = match.group(1).strip()
        if https_host(url) in ALLOWED_IMAGE_HOSTS:
            return url
    return None


def load_posts() -> list[dict[str, object]]:
    root = ElementTree.fromstring(fetch(FEED_URL, accept="application/rss+xml"))
    posts: list[dict[str, object]] = []
    for item in root.findall("./channel/item"):
        title = " ".join((item.findtext("title") or "").split())
        link = (item.findtext("link") or "").strip()
        published_text = (item.findtext("pubDate") or "").strip()
        if not title or not link or not published_text:
            continue
        if https_host(link) != ALLOWED_LINK_HOST:
            continue
        image = item_image_url(item)
        if not image:
            continue
        episode_match = EPISODE_RE.match(title)
        posts.append(
            {
                "published": parse_published(published_text),
                "link": link,
                "image": image,
                "episode_number": episode_match.group(1) if episode_match else "",
                "episode": f"ep. {episode_match.group(1)}" if episode_match else "",
                "title": episode_match.group(2) if episode_match else title,
            }
        )
    posts.sort(key=lambda post: post["published"], reverse=True)
    chosen = posts[:CARD_COUNT]
    if len(chosen) < CARD_COUNT:
        raise UpdateError(
            f"feed {FEED_URL} has {len(chosen)} usable posts; expected {CARD_COUNT}"
        )
    return chosen


def asset_name(post: dict[str, object]) -> str:
    number = str(post["episode_number"])
    if number.isdigit():
        return f"substack-ep-{number}.jpg"
    slug = urlparse(str(post["link"])).path.rstrip("/").split("/")[-1]
    slug = re.sub(r"[^a-z0-9-]+", "-", slug.lower()).strip("-")[:80]
    if not slug:
        raise UpdateError(f"could not name a cover for {post['link']}")
    return f"substack-{slug}.jpg"


def fetch_cover(post: dict[str, object]) -> tuple[str, bytes, int, int]:
    """Download a cover before any file is touched, so a failed fetch writes nothing."""
    filename = asset_name(post)
    data = fetch(resized_cover_url(str(post["image"])), accept="image/jpeg")
    width, height = jpeg_size(data)
    return filename, data, width, height


def render_card(post: dict[str, object], src: str, width: int, height: int) -> str:
    lines = [
        f'{INDENT_CARD}<a class="_postCard_1r3da_70" href="{escape(str(post["link"]), quote=True)}" target="_blank" rel="noopener noreferrer">',
        f'{INDENT_CHILD}<img class="post-thumb" src="{escape(src, quote=True)}" width="{width}" height="{height}" alt="" />',
    ]
    episode = str(post["episode"])
    if episode:
        lines.append(
            f'{INDENT_CHILD}<span class="_postEpisode_1r3da_87">{escape(episode)}</span>'
        )
    published = post["published"]
    assert isinstance(published, datetime)
    date_label = f"{published.day} {MONTHS[published.month - 1]} {published.year}"
    lines.append(
        f'{INDENT_CHILD}<span class="post-date">{escape(date_label)}</span>'
    )
    lines.append(
        f'{INDENT_CHILD}<span class="_postTitle_1r3da_95">{escape(str(post["title"]))}</span>'
    )
    lines.append(f"{INDENT_CARD}</a>")
    return "\n".join(lines)


def ensure_markers(text: str) -> str:
    starts = text.count(START)
    ends = text.count(END)
    if starts == 1 and ends == 1:
        if text.find(START) > text.find(END):
            raise UpdateError("SUBSTACK markers are out of order")
        return text
    if starts or ends:
        raise UpdateError("SUBSTACK markers are unbalanced")
    opening = text.find(POSTS_OPEN)
    if opening == -1 or text.find(POSTS_OPEN, opening + 1) != -1:
        raise UpdateError("expected exactly one newsletter posts container")
    closing = text.find("</div>", opening)
    if closing == -1:
        raise UpdateError("newsletter posts container is not closed")
    interior = (
        f"\n{INDENT_CARD}{START}\n"
        f"{INDENT_CARD}{END}\n"
        f"{INDENT_DIV}"
    )
    return text[: opening + len(POSTS_OPEN)] + interior + text[closing:]


def apply_cards(text: str, cards: str) -> str:
    start = text.find(START)
    end = text.find(END)
    if start == -1 or end == -1 or start > end:
        raise UpdateError("SUBSTACK markers are missing")
    if text.find(START, start + len(START)) != -1 or text.find(END, end + len(END)) != -1:
        raise UpdateError("SUBSTACK markers appear more than once")
    interior = f"\n{cards}\n{INDENT_CARD}"
    return text[: start + len(START)] + interior + text[end:]


def main() -> int:
    try:
        posts = load_posts()
        covers = [fetch_cover(post) for post in posts]
        rendered: list[str] = []
        images_changed = False
        for post, (filename, data, width, height) in zip(posts, covers):
            images_changed = images_changed or write_if_changed(ASSETS_DIR / filename, data)
            rendered.append(render_card(post, f"/assets/{filename}", width, height))
            published = post["published"]
            assert isinstance(published, datetime)
            print(
                f"{post['episode'] or '(no episode)'}  "
                f"{published.day} {MONTHS[published.month - 1]} {published.year}  "
                f"{post['title']}"
            )
        original = INDEX_PATH.read_bytes()
        text = original.decode("utf-8")
        updated = apply_cards(ensure_markers(text), "\n".join(rendered)).encode("utf-8")
    except UpdateError as exc:
        die(str(exc))
    if updated == original:
        print("unchanged" if not images_changed else "updated covers")
        return 0
    INDEX_PATH.write_bytes(updated)
    print("updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
