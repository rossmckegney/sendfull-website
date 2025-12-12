#!/usr/bin/env python3

"""
RSS Feed Updater for Sendfull Website

This script fetches the latest posts from the Sendfull Substack RSS feed
and updates the newsletter-rss.json file for the website.
"""

import subprocess
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

RSS_URL = 'https://sendfull.substack.com/feed'

def fetch_rss():
    """Fetch the RSS feed from Substack using curl"""
    print('📡 Fetching RSS feed...')
    try:
        result = subprocess.run(
            ['curl', '-s', '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', RSS_URL],
            capture_output=True,
            text=True,
            timeout=15
        )
        if result.returncode != 0:
            raise Exception(f'curl failed with return code {result.returncode}')
        return result.stdout
    except subprocess.TimeoutExpired:
        raise Exception('Request timeout')
    except FileNotFoundError:
        raise Exception('curl not found. Please install curl.')

def parse_rss(xml_text):
    """Parse RSS XML and extract posts"""
    posts = []
    
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        # Fallback to regex parsing if XML parsing fails
        return parse_rss_regex(xml_text)
    
    # Handle RSS 2.0 format
    items = root.findall('.//item')
    
    for item in items[:9]:  # Limit to 9 posts
        title_elem = item.find('title')
        title = title_elem.text if title_elem is not None else ''
        
        # Handle CDATA in title
        if title_elem is not None and title_elem.text is None:
            title = ''.join(title_elem.itertext())
        
        desc_elem = item.find('description')
        description = desc_elem.text if desc_elem is not None else ''
        if desc_elem is not None and desc_elem.text is None:
            description = ''.join(desc_elem.itertext())
        
        link_elem = item.find('link')
        link = link_elem.text if link_elem is not None else ''
        
        pub_date_elem = item.find('pubDate')
        pub_date = pub_date_elem.text if pub_date_elem is not None else ''
        
        # Extract image from enclosure
        enclosure = item.find('enclosure')
        image = ''
        if enclosure is not None:
            image = enclosure.get('url', '')
        
        # Extract read time from description
        read_time_match = re.search(r'(\d+)\s*min\s*read', description, re.IGNORECASE)
        read_time = f"{read_time_match.group(1)} min read" if read_time_match else '5 min read'
        
        # Clean description (remove HTML tags)
        clean_description = re.sub(r'<[^>]+>', '', description)
        if len(clean_description) > 200:
            clean_description = clean_description[:200] + '...'
        
        if title and link:
            posts.append({
                'title': title.strip(),
                'description': clean_description.strip(),
                'link': link.strip(),
                'pubDate': pub_date.strip(),
                'image': image.strip() if image else f'https://picsum.photos/400/250?random={len(posts)}',
                'readTime': read_time
            })
    
    return posts

def parse_rss_regex(xml_text):
    """Fallback regex-based RSS parsing"""
    posts = []
    
    # Simple XML parsing to extract posts
    item_pattern = r'<item>([\s\S]*?)</item>'
    items = re.findall(item_pattern, xml_text)
    
    for item_content in items[:9]:  # Limit to 9 posts
        # Extract title (handle CDATA)
        title_match = re.search(r'<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</title>', item_content, re.DOTALL)
        title = title_match.group(1).strip() if title_match else ''
        
        # Extract description (handle CDATA)
        desc_match = re.search(r'<description>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?</description>', item_content, re.DOTALL)
        description = desc_match.group(1).strip() if desc_match else ''
        
        # Extract link
        link_match = re.search(r'<link>(.*?)</link>', item_content)
        link = link_match.group(1).strip() if link_match else ''
        
        # Extract pubDate
        date_match = re.search(r'<pubDate>(.*?)</pubDate>', item_content)
        pub_date = date_match.group(1).strip() if date_match else ''
        
        # Extract image from enclosure
        image_match = re.search(r'<enclosure[^>]*url="([^"]*)"', item_content)
        image = image_match.group(1) if image_match else f'https://picsum.photos/400/250?random={len(posts)}'
        
        # Extract read time from description
        read_time_match = re.search(r'(\d+)\s*min\s*read', description, re.IGNORECASE)
        read_time = f"{read_time_match.group(1)} min read" if read_time_match else '5 min read'
        
        # Clean description (remove HTML tags)
        clean_description = re.sub(r'<[^>]+>', '', description)
        if len(clean_description) > 200:
            clean_description = clean_description[:200] + '...'
        
        if title and link:
            posts.append({
                'title': title,
                'description': clean_description,
                'link': link,
                'pubDate': pub_date,
                'image': image,
                'readTime': read_time
            })
    
    return posts

def main():
    try:
        print('🚀 Starting RSS feed update...\n')
        
        xml_text = fetch_rss()
        
        # Validate RSS feed
        if '<rss' not in xml_text and '<feed' not in xml_text:
            raise ValueError('Invalid RSS feed format')
        
        posts = parse_rss(xml_text)
        print(f'✅ Successfully parsed {len(posts)} posts')
        
        if len(posts) == 0:
            raise ValueError('No posts found in RSS feed')
        
        output = {
            'lastUpdated': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            'posts': posts
        }
        
        # Check if file exists and compare
        has_changes = False
        try:
            with open('newsletter-rss.json', 'r') as f:
                existing_data = json.load(f)
            
            print(f'Existing lastUpdated: {existing_data.get("lastUpdated", "N/A")}')
            print(f'New lastUpdated: {output["lastUpdated"]}')
            
            # Compare the posts
            if json.dumps(existing_data.get('posts', []), sort_keys=True) != json.dumps(posts, sort_keys=True):
                has_changes = True
                print('📝 Changes detected in RSS feed')
            else:
                print('ℹ️ No changes detected in RSS feed')
        except FileNotFoundError:
            has_changes = True
            print('📝 Creating new newsletter-rss.json file')
        
        if has_changes:
            with open('newsletter-rss.json', 'w') as f:
                json.dump(output, f, indent=2)
            print('💾 Updated newsletter-rss.json')
            
            print('\n📋 Latest posts:')
            for i, post in enumerate(posts, 1):
                print(f'{i}. {post["title"]}')
            
            print('\n🎉 RSS feed update complete!')
        else:
            print('ℹ️ No changes to commit')
        
    except Exception as error:
        print(f'❌ Error updating RSS feed: {error}')
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == '__main__':
    main()

