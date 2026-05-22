/* Sendfull static nav — mobile hamburger toggle. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobile = document.querySelector('.nav-mobile');
  if (!toggle || !mobile) return;

  function setOpen(open) {
    mobile.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  toggle.addEventListener('click', function () {
    setOpen(!mobile.classList.contains('open'));
  });

  /* close the menu when a link inside it is followed */
  mobile.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });
})();
