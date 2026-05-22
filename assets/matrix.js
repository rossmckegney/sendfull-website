/* Sendfull — Autonomy Decision Matrix renderer (static port of DecisionMatrix.jsx).
   Builds the animated 2x2 into a host element and triggers the draw-in
   when the element scrolls into view. Exposes window.SendfullMatrix.render. */
(function () {
  var QUADRANTS = {
    hold: { key: 'hold', name: 'Hold', cell: 'bl', color: 'var(--q-hold)' },
    question: { key: 'question', name: 'Question', cell: 'br', color: 'var(--q-question)' },
    assist: { key: 'assist', name: 'Assist', cell: 'tl', color: 'var(--q-assist)' },
    automate: { key: 'automate', name: 'Automate', cell: 'tr', color: 'var(--q-automate)' },
  };
  var ORDER = ['hold', 'question', 'assist', 'automate'];
  var SHORT = {
    hold: 'Don’t invest yet',
    question: 'Repurpose the capability',
    assist: 'Build a Human-in-the-Loop system',
    automate: 'Scale toward Human-on-the-Loop',
  };
  var CELL_XY = { tl: [0, 0], tr: [50, 0], bl: [0, 50], br: [50, 50] };
  var CENTROID_TR = [75, 25];

  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render(host, result, label) {
    label = label || 'You are here';
    var could = result.could,
      should = result.should,
      quadrant = result.quadrant;

    var mx = clamp(could * 100, 7, 93);
    var my = clamp((1 - should) * 100, 7, 93);
    var tx = CENTROID_TR[0],
      ty = CENTROID_TR[1];
    var isAtAutomate = quadrant === 'automate';

    /* curved arrow from marker to North Star */
    var cx = (mx + tx) / 2 + (my - ty) * 0.18;
    var cy = (my + ty) / 2 - 8;
    var arrowPath = 'M ' + mx + ' ' + my + ' Q ' + cx + ' ' + cy + ' ' + tx + ' ' + ty;

    var svgRects = ORDER.map(function (k, i) {
      var q = QUADRANTS[k];
      var xy = CELL_XY[q.cell];
      var active = k === quadrant;
      var op = active ? 0.16 : 0.04;
      return (
        '<rect class="matrix-fill" x="' +
        xy[0] +
        '" y="' +
        xy[1] +
        '" width="50" height="50" fill="' +
        q.color +
        '" style="--fill-opacity:' +
        op +
        ';--fill-delay:' +
        (0.25 + i * 0.07) +
        's"/>'
      );
    }).join('');

    var quadLabels = ORDER.map(function (k, i) {
      var q = QUADRANTS[k];
      return (
        '<div class="matrix-quad ' +
        q.cell +
        '" data-active="' +
        (k === quadrant) +
        '" style="--quad-color:' +
        q.color +
        ';--quad-delay:' +
        (0.7 + i * 0.08) +
        's">' +
        '<span class="matrix-quad-name">' +
        q.name +
        '</span>' +
        '<span class="matrix-quad-desc">' +
        SHORT[k] +
        '</span>' +
        '</div>'
      );
    }).join('');

    var target = isAtAutomate
      ? ''
      : '<div class="matrix-target" style="left:' +
        tx +
        '%;top:' +
        ty +
        '%">' +
        '<span class="matrix-target-dot"></span>' +
        '<span class="matrix-target-label">North Star</span>' +
        '</div>';

    var arrow = isAtAutomate
      ? ''
      : '<path class="matrix-arrow" d="' +
        arrowPath +
        '" fill="none" stroke="var(--accent-bright)" stroke-width="0.9" ' +
        'stroke-linecap="round" stroke-dasharray="2.4 2" marker-end="url(#adm-arrow)"/>';

    host.classList.add('matrix-wrap');
    host.innerHTML =
      '<div class="matrix" style="--mx:' +
      mx +
      '%;--my:' +
      my +
      '%">' +
      '<svg class="matrix-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<defs><marker id="adm-arrow" markerWidth="5.5" markerHeight="5.5" refX="4.2" refY="2.75" orient="auto">' +
      '<path d="M0,0 L5.5,2.75 L0,5.5 Z" fill="var(--accent-bright)"/></marker></defs>' +
      svgRects +
      '<line class="matrix-axisline" x1="50" y1="0" x2="50" y2="100" stroke="var(--border-strong)" stroke-width="0.6" style="--line-delay:0.5s"/>' +
      '<line class="matrix-axisline" x1="0" y1="50" x2="100" y2="50" stroke="var(--border-strong)" stroke-width="0.6" style="--line-delay:0.6s"/>' +
      arrow +
      '</svg>' +
      quadLabels +
      target +
      '<div class="matrix-marker">' +
      '<span class="matrix-marker-ring"></span>' +
      '<span class="matrix-marker-dot"></span>' +
      '<span class="matrix-marker-label">' +
      esc(label) +
      '</span>' +
      '</div>' +
      '<span class="axis-end" style="left:8px;bottom:6px">Low</span>' +
      '<span class="axis-end" style="right:8px;bottom:6px">High</span>' +
      '</div>' +
      '<span class="matrix-axis axis-x">Could you automate? · capability →</span>' +
      '<span class="matrix-axis axis-y">Should you automate? · value →</span>' +
      '<span class="sr-only">Your initiative sits in the ' +
      QUADRANTS[quadrant].name +
      ' quadrant.</span>';

    /* trigger draw-in when in view */
    var reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      host.classList.add('in');
    } else {
      var obs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      obs.observe(host);
    }
  }

  window.SendfullMatrix = { render: render, QUADRANTS: QUADRANTS };
})();
