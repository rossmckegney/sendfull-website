/* Sendfull static reveal animations (workshop + diagnostic landing).
   - .reveal       : fade + rise once scrolled into view (replaces <Reveal>)
   - [data-countup]: animated number once in view (replaces <CountUp>)
   Honours prefers-reduced-motion. Scroll-based — no IntersectionObserver. */
(function () {
  var reduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- count-up numbers ---- */
  function runCount(el) {
    var to = parseFloat(el.getAttribute('data-countup')) || 0;
    var dur = (parseFloat(el.getAttribute('data-duration')) || 1.4) * 1000;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduce) {
      el.textContent = to + suffix;
      return;
    }
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3); /* ease-out cubic */
      el.textContent = Math.round(eased * to) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var counts = Array.prototype.slice.call(
    document.querySelectorAll('[data-countup]')
  );
  if (!reveals.length && !counts.length) return;

  if (reduce) {
    reveals.forEach(function (el) {
      el.classList.add('in');
    });
    counts.forEach(runCount);
    return;
  }

  /* getBoundingClientRect on scroll — reliable in every browser. */
  function check() {
    var vh = window.innerHeight;
    reveals = reveals.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.88 && (r.width || r.height)) {
        el.classList.add('in');
        return false;
      }
      return true;
    });
    counts = counts.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.85 && (r.width || r.height)) {
        runCount(el);
        return false;
      }
      return true;
    });
    if (!reveals.length && !counts.length) {
      document.removeEventListener('scroll', check, { capture: true });
      window.removeEventListener('resize', check);
    }
  }

  check(); // animate whatever is already on screen
  /* capture-phase on document catches scroll from the window AND from
     inner scroll containers (these pages scroll <body>, not window). */
  document.addEventListener('scroll', check, { capture: true, passive: true });
  window.addEventListener('resize', check, { passive: true });
})();
