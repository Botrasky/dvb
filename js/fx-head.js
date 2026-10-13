// ========== FX: runs in <head>, before the first paint ==========
// Decides whether the motion effects are on, restores the saved theme early,
// arms the entrance animations (so components never flash in and out), and
// picks the direction of the cube turn when arriving from another page.
(function () {
  var html = document.documentElement;
  var TURN = 1200;                       // ms, matches --fx-turn in fx.css

  // The effects follow the system's Reduce Motion setting. ?motion=on forces
  // them on, ?motion=off forces them off, ?motion=system goes back to the
  // default. The choice lasts for the browser session.
  var mode = null;
  try {
    var asked = new URLSearchParams(location.search).get('motion');
    if (asked) sessionStorage.setItem('fxMotion', asked);
    mode = sessionStorage.getItem('fxMotion');
  } catch (e) { /* storage blocked: stay on the default */ }
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var on = mode === 'off' ? false : mode === 'on' ? true : !reduced;

  var FX = window.__fx = { on: on, mode: mode, reduced: reduced, turn: TURN, holdUntil: 0, log: [] };

  // The saved theme is applied here, not at the end of the page, so a light-mode
  // visitor never sees a dark first frame (and the cube faces match the theme).
  try {
    if (localStorage.getItem('theme') === 'light') html.classList.add('light-mode');
  } catch (e) { /* ignore */ }

  // Arriving from another page of the site.
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    if (!on) {
      e.viewTransition.ready.catch(function () { /* skipped on purpose */ });
      e.viewTransition.skipTransition();
      return;
    }
    var dir = null;
    try { dir = sessionStorage.getItem('fxDir'); sessionStorage.removeItem('fxDir'); } catch (err) { /* ignore */ }
    html.dataset.cube = dir || 'left';   // back/forward buttons turn back to the left
    FX.holdUntil = performance.now() + TURN * 0.5;     // same share as SCENE_HOLD in fx.js
    FX.log.push('reveal:' + html.dataset.cube);
    e.viewTransition.ready.then(FX.measure, function () { /* no transition */ });
    e.viewTransition.finished.finally(function () { delete html.dataset.cube; });
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) delete html.dataset.cube;
  });

  if (!on) return;
  html.classList.add('fx-on', 'fx-arm');

  // Exact size of the cube faces. vw/vh drift on phones, so the estimate from
  // the window is replaced by the real snapshot size once a turn has started.
  function size() {
    html.style.setProperty('--fx-vw', html.clientWidth + 'px');
    html.style.setProperty('--fx-vh', window.innerHeight + 'px');
  }
  size();
  window.addEventListener('resize', size);
  FX.measure = function () {
    var box = getComputedStyle(html, '::view-transition-group(root)');
    var w = parseFloat(box.width), h = parseFloat(box.height);
    if (w > 0 && h > 0) {
      html.style.setProperty('--fx-vw', w + 'px');
      html.style.setProperty('--fx-vh', h + 'px');
    }
  };

  // Everything that gets a staged entrance. One list, used here to hide the
  // components before the first paint and by fx.js to animate them in.
  FX.targets = [
    // homepage
    '.section-tag', '.section-title', '.section-line', '.section-sub',
    '.about-text > *', '.about-card', '.chart-wrap', '.timeline-item', '.slideshow-wrap',
    '.ach-card', '.edu-card', '.road-card', '.contact-item', '.cta-box',
    '#writeups .container > .reveal',
    // writeups hub
    '.wu-tag', '.wu-page-title', '.wu-page-sub', '.wu-controls', '.wu-card',
    // a writeup
    '.wu-back', '.wu-report-head', '.wu-meta-line', '.wu-glance > div', '.wu-flag-wrap',
    '.wu-kill-chain', '.wu-mitre-table', '.wu-vuln-analysis', '.wu-body > *', '.wu-references'
  ].join(',');

  var style = document.createElement('style');
  style.textContent = 'html.fx-arm :is(' + FX.targets + '){opacity:0}';
  document.head.appendChild(style);

  // If fx.js never runs, nothing may stay hidden.
  setTimeout(function () { html.classList.remove('fx-arm'); }, 3000);
})();
