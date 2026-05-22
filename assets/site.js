/* Sendfull static site behaviours: mobile nav, scroll reveal, hero word rotation. */
(function () {
  'use strict';

  var reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Mobile navigation                                                */
  /* ---------------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.querySelector('._toggle_1lvbt_2');
    var mobileNav = document.querySelector('._mobileNav_vtju4_126');
    if (!toggle || !mobileNav) return;

    var icons = toggle.querySelectorAll('._icon_1lvbt_25');

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileNav.setAttribute('data-visible', open ? 'true' : 'false');
      // toggle the menu / close icon swap
      icons.forEach(function (icon) {
        icon.setAttribute('data-open', open ? 'true' : 'false');
      });
      var links = mobileNav.querySelectorAll('._mobileNavLink_vtju4_156');
      links.forEach(function (link) {
        link.setAttribute('data-visible', open ? 'true' : 'false');
      });
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });

    // close when a mobile nav link is clicked
    mobileNav.querySelectorAll('._mobileNavLink_vtju4_156').forEach(function (link) {
      link.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Scroll reveal                                                    */
  /* ---------------------------------------------------------------- */
  function initScrollReveal() {
    /* every hidden element except the mobile-nav drawer, which is
       driven by the hamburger toggle, not by scrolling. */
    var pending = Array.prototype.slice.call(
      document.querySelectorAll('[data-visible="false"]:not([class*="_mobileNav"])')
    );
    if (!pending.length) return;

    if (reducedMotion) {
      pending.forEach(function (el) {
        el.setAttribute('data-visible', 'true');
      });
      return;
    }

    /* getBoundingClientRect on scroll — reliable in every browser,
       no IntersectionObserver dependency. */
    function check() {
      var vh = window.innerHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh * 0.9 && (r.width || r.height)) {
          el.setAttribute('data-visible', 'true');
          return false;
        }
        return true;
      });
      if (!pending.length) {
        document.removeEventListener('scroll', check, { capture: true });
        window.removeEventListener('resize', check);
      }
    }

    check(); // reveal whatever is already on screen
    /* capture-phase on document catches scroll from the window AND from
       inner scroll containers (the app pages scroll <body>, not window). */
    document.addEventListener('scroll', check, { capture: true, passive: true });
    window.addEventListener('resize', check, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /* Hero rotating word (homepage)                                    */
  /* ---------------------------------------------------------------- */
  function initHeroWords() {
    var row = document.querySelector('[data-hero-words]');
    if (!row) return;

    var disciplines = [
      'AI',
      'Agents',
      'Product Strategy',
      'Vendor Selection',
      'Recruiting',
      'M&A',
      'Evals',
    ];
    var words = row.querySelectorAll('._word_11075_122');
    if (words.length < 2) return;

    var current = words[0];
    var incoming = words[1];
    var index = 0;

    if (reducedMotion) {
      current.textContent = disciplines[0];
      current.setAttribute('data-status', 'entered');
      incoming.setAttribute('data-status', 'exiting');
      return;
    }

    function cycle() {
      var next = (index + 1) % disciplines.length;
      // incoming word takes the next discipline and enters
      incoming.textContent = disciplines[next];
      incoming.setAttribute('data-status', 'entering');
      // current word exits
      current.setAttribute('data-status', 'exiting');

      // after the enter animation settles, mark entered and swap roles
      window.setTimeout(function () {
        incoming.setAttribute('data-status', 'entered');
        var tmp = current;
        current = incoming;
        incoming = tmp;
        index = next;
        // reset the now-hidden word so it is ready to enter next time
        incoming.setAttribute('data-status', 'exiting');
      }, 1600);
    }

    window.setInterval(cycle, 4500);
  }

  /* ---------------------------------------------------------------- */
  /* Floating labels (contact form)                                   */
  /* ---------------------------------------------------------------- */
  function initFloatingLabels() {
    var fields = document.querySelectorAll('._container_1ukhq_2');
    fields.forEach(function (field) {
      var input = field.querySelector('._input_1ukhq_21');
      var label = field.querySelector('._label_1ukhq_73');
      var underline = field.querySelector('._underline_1ukhq_55');
      if (!input || !label) return;

      function refresh() {
        var filled = !!input.value;
        label.setAttribute('data-filled', filled ? 'true' : 'false');
      }

      input.addEventListener('focus', function () {
        label.setAttribute('data-focused', 'true');
        if (underline) underline.setAttribute('data-focused', 'true');
      });
      input.addEventListener('blur', function () {
        label.setAttribute('data-focused', 'false');
        if (underline) underline.setAttribute('data-focused', 'false');
        refresh();
      });
      input.addEventListener('input', refresh);
      refresh();
    });
  }

  /* ---------------------------------------------------------------- */
  /* Hero scroll indicator — hide once the visitor scrolls (homepage)  */
  /* ---------------------------------------------------------------- */
  function initScrollIndicator() {
    var indicators = document.querySelectorAll(
      '[class*="_scrollIndicator"], [class*="_mobileScrollIndicator"]'
    );
    if (!indicators.length) return;

    function update() {
      var hidden = window.scrollY > window.innerHeight * 0.4;
      indicators.forEach(function (el) {
        el.setAttribute('data-hidden', hidden ? 'true' : 'false');
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------------------------------------------------------- */
  /* Decode / scramble text — the hero name and section headings      */
  /* resolve letter-by-letter out of random glyphs as they come into  */
  /* view (the signature text animation of the site).                 */
  /* ---------------------------------------------------------------- */
  function initDecode() {
    /* charset matches the original DecoderText component */
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-×÷=#@&%!?*';
    function glyph() {
      return GLYPHS.charAt((Math.random() * GLYPHS.length) | 0);
    }

    var targets = document.querySelectorAll(
      '._name_11075_35, ._title_xvg9q_30, #about-title, #offerings-title, ._newsletterTitle_1r3da_29'
    );
    if (!targets.length) return;
    var pending = Array.prototype.slice.call(targets);

    function decodeEl(el) {
      if (el.getAttribute('data-decoded')) return;
      el.setAttribute('data-decoded', '1');
      /* the hero name wraps its text in a <span> next to the logo —
         animate that; plain headings animate themselves. */
      var host = el.querySelector('span') || el;
      var finalText = host.textContent.trim();
      if (!finalText) return;
      if (reducedMotion) return; // leave the resolved text untouched

      var len = finalText.length;
      var prev = [];
      for (var k = 0; k < len; k++) prev.push(glyph());
      /* ease-out reveal approximating the original spring (stiffness 8) */
      var duration = 700 + len * 90;
      var startT = performance.now();

      function frame() {
        var t = Math.min((performance.now() - startT) / duration, 1);
        var n = (1 - Math.pow(1 - t, 3)) * len; // chars resolved left-to-right
        var flicker = n % 1 < 0.5; // re-randomise unresolved glyphs
        var out = '';
        for (var i = 0; i < len; i++) {
          if (i < n) {
            out += finalText.charAt(i);
          } else {
            if (flicker) prev[i] = glyph();
            out += prev[i];
          }
        }
        host.textContent = out;
        if (t < 1) requestAnimationFrame(frame);
        else host.textContent = finalText;
      }
      requestAnimationFrame(frame);
    }

    /* getBoundingClientRect on scroll — reliable everywhere, no
       IntersectionObserver dependency. */
    function check() {
      var vh = window.innerHeight;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          decodeEl(el);
          return false;
        }
        return true;
      });
      if (!pending.length) {
        document.removeEventListener('scroll', check, { capture: true });
      }
    }

    check(); // anything already in view decodes now
    document.addEventListener('scroll', check, { capture: true, passive: true });
  }

  function init() {
    initMobileNav();
    initScrollReveal();
    initHeroWords();
    initScrollIndicator();
    initDecode();
    initFloatingLabels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
