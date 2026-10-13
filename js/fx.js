// ========== FX: staged entrances + cube turns ==========
// Took over from js/scroll.js. Three jobs:
//   1. Components enter one after another from the left, right, top or bottom,
//      with a HUD-style frame and scan line, as they scroll into view.
//   2. A link to another section of the same page turns the view like a cube
//      (right, left, up or down) instead of scrolling there.
//   3. A link to another page of the site records which way the cube should
//      turn; the turn itself is a cross-page view transition styled in fx.css.
// If the effects are off (see fx-head.js) it only does what scroll.js did.
(function () {
  var FX = window.__fx || { on: false, log: [] };
  var html = document.documentElement;

  function skillBars(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('.skill-bar-fill'), function (bar, i) {
      bar.style.transitionDelay = (FX.on ? i * 70 : 0) + 'ms';
      bar.style.width = bar.dataset.width + '%';
    });
  }

  // The theme toggle sets its class on <body>; mirror it on <html> so the
  // cube faces and the early-theme rule in fx-head.js stay in step. This runs
  // with the effects off too, or a saved light theme could not be switched off.
  function syncTheme() { html.classList.toggle('light-mode', document.body.classList.contains('light-mode')); }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  if (!FX.on) {
    // The original behaviour: fade up on scroll, fill the skill bars.
    var plain = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (el) { plain.observe(el); });
    var bars = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) skillBars(en.target); });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(document.querySelectorAll('#skills'), function (el) { bars.observe(el); });
    return;
  }

  // ----- backdrop: a hooded figure at a laptop, behind all content -----
  // Drawn inline (no image file). It sits under the sections, takes no clicks,
  // and only the terminal text changes, so it never moves the page.
  (function () {
    var S = 'http://www.w3.org/2000/svg';
    var wrap = document.createElement('div');
    wrap.className = 'fx-hacker';
    wrap.setAttribute('aria-hidden', 'true');
    var hood = 'M460 40C360 40 310 130 310 230C310 290 325 330 340 360L280 400C220 430 190 500 180 720L740 720C730 500 700 430 640 400L580 360C595 330 610 290 610 230C610 130 560 40 460 40Z';
    var figure =
      '<path d="' + hood + '"/>' +
      '<path class="void" d="M460 110C395 110 365 170 365 240C365 300 400 350 460 365C520 350 555 300 555 240C555 170 525 110 460 110Z"/>' +
      '<path d="M340 360C380 395 420 410 460 412C500 410 540 395 580 360M430 366L422 455M490 366L498 455M335 170C325 215 327 265 340 310M585 170C595 215 593 265 580 310"/>' +
      '<path d="M250 500C275 590 320 640 372 662M670 500C645 590 600 640 548 662"/>' +
      '<rect class="void" x="330" y="520" width="260" height="170" rx="10"/>' +
      '<path d="M300 690L620 690L642 712L278 712Z"/>' +
      '<path d="M330 540H590"/>';
    var lines = '';
    for (var i = 0; i < 7; i++) lines += '<text x="344" y="' + (560 + i * 18) + '"></text>';
    wrap.innerHTML =
      '<svg viewBox="0 0 760 720" preserveAspectRatio="xMaxYMax meet">' +
        '<g class="glow">' + figure + '</g><g class="line">' + figure + '</g>' +
        '<path class="eyes" d="M408 236L444 244M512 236L476 244"/>' +
        '<g class="term"><circle cx="344" cy="530" r="3"/><circle cx="356" cy="530" r="3"/><circle cx="368" cy="530" r="3"/>' +
          lines + '</g>' +
      '</svg>';
    document.body.insertBefore(wrap, document.body.firstChild);

    // Generic lab-style output, typed in a loop.
    var SCRIPT = [
      '$ whoami', 'ethical_hacker', '$ scope --check lab.local', '[+] authorized: yes',
      '$ nmap -sV lab.local', '[+] 22/tcp  open  ssh', '[+] 80/tcp  open  http',
      '$ ./report --write', '[+] findings saved', '$ _'
    ];
    var rows = wrap.querySelectorAll('.term text'), shown = [], li = 0, ci = 0, wait = 0;
    function draw(cursor) {
      for (var r = 0; r < rows.length; r++) {
        var s = shown[r] || '';
        rows[r].textContent = (r === shown.length - 1 && cursor) ? s + '▌' : s;
      }
    }
    setInterval(function () {
      if (document.hidden) return;
      if (wait > 0) { wait--; if (wait % 6 === 0) draw(wait % 12 === 0); return; }
      if (li >= SCRIPT.length) { shown = []; li = 0; ci = 0; draw(false); return; }
      var full = SCRIPT[li], typed = full.charAt(0) === '$';
      if (ci === 0) { shown.push(''); if (shown.length > rows.length) shown.shift(); }
      ci = typed ? ci + 1 : full.length;                 // commands are typed, output appears at once
      shown[shown.length - 1] = full.slice(0, ci);
      draw(true);
      if (ci >= full.length) { li++; ci = 0; wait = li >= SCRIPT.length ? 40 : typed ? 7 : 3; }
    }, 55);
  })();

  // =====================================================================
  // 1. Staged entrances
  // =====================================================================
  var PRESETS = [                 // [selector, side it comes from or special kind]
    ['.section-tag', 'left'], ['.section-title', 'decode'], ['.section-line', 'draw'],
    ['.wu-tag', 'left'], ['.wu-page-title', 'decode'], ['.wu-back', 'left'],
    ['.wu-report-head', 'top'], ['.wu-meta-line', 'left'], ['.wu-flag-wrap', 'left'],
    ['.wu-body > h2', 'left'], ['.wu-insight', 'right'], ['.wu-vuln-analysis', 'left'],
    ['.timeline-item', 'right'], ['.slideshow-wrap', 'zoom'], ['.wu-kill-chain', 'zoom']
  ];
  var DECODE = '.section-title, .wu-page-title, .wu-body > h2';
  var HUD = '.about-card, .chart-wrap, .exp-card, .ach-card, .edu-card, .road-card, .cta-box, ' +
            '.contact-item, .wu-card, .wu-glance > div, .wu-code, .wu-kill-chain, .wu-vuln-analysis';

  var items = Array.prototype.slice.call(document.querySelectorAll(FX.targets));
  items.forEach(function (el) {
    el.classList.add('fx');
    for (var i = 0; i < PRESETS.length; i++) {
      if (el.matches(PRESETS[i][0])) { el.dataset.fx = PRESETS[i][1]; break; }
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll(HUD), function (host) {
    if (!host.closest('.fx')) return;
    host.classList.add('fx-hud-host');
    var hud = document.createElement('i');
    hud.className = 'fx-hud';
    hud.setAttribute('aria-hidden', 'true');
    host.appendChild(hud);
  });
  // attack chains light up one step at a time
  Array.prototype.forEach.call(document.querySelectorAll('.wu-chain'), function (chain) {
    chain.classList.add('fx-chain');
    Array.prototype.forEach.call(chain.children, function (node, i) { node.style.setProperty('--i', i); });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.wu-mitre-table tbody tr, .wu-references li, .about-card .detail-row'), function (row) {
    var i = Array.prototype.indexOf.call(row.parentNode.children, row);
    row.style.setProperty('--r', i);
  });

  // Every section plays as a scene on one clock. Steps are
  // [selector, side, start ms, duration ms, ms between matches].
  // HEAD runs first everywhere: the header drops in from the top in 0.7s.
  var HEAD = [
    ['.section-tag, .wu-tag, .wu-back',                    'top',  0,   700],
    ['.section-title, .wu-page-title, .wu-report-head',    'top',  0,   700],
    ['.section-line',                                      'draw', 250, 450],
    ['.section-sub, .wu-page-sub, .wu-meta-line',          'top',  150, 700]
  ];
  // Hand-set steps for a section. Anything not listed follows from BODY_AT,
  // one after another, from the side of the screen it sits on.
  var SCENES = {
    about: [
      ['.about-text > *', 'left',  600,  750, 110],   // each block 0.75s, 0.11s apart
      ['.about-card',     'right', 1100, 850]         // starts at 1.1s, 0.85s
    ]
  };
  var BODY_AT = 600, BODY_GAP = 110, BODY_DUR = 750;
  var SCENE_HOLD = 0.5;           // share of a cube turn that passes before a scene starts
  var sceneOf = new Map();
  var scopes = Array.prototype.slice.call(document.querySelectorAll('body > section[id]'));
  if (!scopes.length) scopes = [document.body];
  scopes.forEach(function (scope) {
    var scene = { t0: 0 }, order = 0, prev = 0;
    function add(el, side, at, dur, gap) {
      if (!el.classList.contains('fx') || sceneOf.has(el)) return;
      if (side) el.dataset.fx = side;
      el.classList.add('fx-scene');
      el.style.setProperty('--fx-dur', dur + 'ms');
      sceneOf.set(el, { scene: scene, order: order++, at: at, gap: gap == null ? Math.min(150, Math.max(0, at - prev)) : gap });
      prev = at;
    }
    HEAD.concat(SCENES[scope.id] || []).forEach(function (s) {
      Array.prototype.forEach.call(scope.querySelectorAll(s[0]), function (el, k) {
        add(el, s[1], s[2] + k * (s[4] || 0), s[3]);
      });
    });
    Array.prototype.forEach.call(scope.querySelectorAll('.fx'), function (el) {
      add(el, null, BODY_AT, BODY_DUR, BODY_GAP);
    });
  });
  html.classList.remove('fx-arm');    // from here on the .fx class does the hiding

  // Which side a component comes from, judged by where it sits on screen.
  var flip = 0;
  function sideFor(el) {
    var r = el.getBoundingClientRect(), vw = window.innerWidth;
    var centre = r.left + r.width / 2;
    if (r.width > vw * 0.62) {
      if (vw >= 720) return 'bottom';
      // phones: one column, so alternate. Only the homepage sections clip
      // sideways overflow, so elsewhere nothing may come in from the right.
      var other = el.closest('body > section') ? 'right' : 'bottom';
      return flip++ % 2 ? other : 'left';
    }
    if (centre < vw * 0.42) return 'left';
    if (centre > vw * 0.58) return 'right';
    return 'bottom';
  }

  // Letters resolve out of random glyphs, left to right.
  var GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&<>[]{}=+*/';
  function decode(el, delay) {
    var nodes = [], walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    if (!nodes.length) return;
    var finals = nodes.map(function (n) { return n.nodeValue; });
    var total = finals.join('').length;
    var duration = Math.min(950, 380 + total * 26), start = 0;
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim());
    function frame(now) {
      if (!start) start = now;
      var p = Math.min(1, (now - start) / duration), solved = Math.floor(p * total), seen = 0;
      nodes.forEach(function (n, k) {
        var out = '', text = finals[k];
        for (var c = 0; c < text.length; c++, seen++) {
          out += (seen < solved || text[c] === ' ') ? text[c] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        n.nodeValue = out;
      });
      if (p < 1) requestAnimationFrame(frame);
      else nodes.forEach(function (n, k) { n.nodeValue = finals[k]; });
    }
    setTimeout(function () { requestAnimationFrame(frame); }, delay);
  }

  function countUp(span, delay) {
    var m = /^(\d+)%$/.exec(span.textContent.trim());
    if (!m) return;
    var target = +m[1], start = 0;
    span.textContent = '0%';
    function frame(now) {
      if (!start) start = now;
      var p = Math.min(1, (now - start) / 1200);
      span.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + '%';
      if (p < 1) requestAnimationFrame(frame);
    }
    setTimeout(function () { requestAnimationFrame(frame); }, delay);
  }

  function enter(el, delay) {
    if (el.classList.contains('fx-in')) return;
    if (!el.dataset.fx) el.dataset.fx = sideFor(el);
    if (el.dataset.fx === 'right' && window.innerWidth < 720 && !el.closest('body > section')) el.dataset.fx = 'left';
    el.style.setProperty('--fx-delay', delay + 'ms');
    el.classList.add('fx-in');
    if (el.matches(DECODE) && el.dataset.fx !== 'top') decode(el, delay);

    var extra = 0;
    if (el.querySelector('.skill-bars')) {
      setTimeout(function () { skillBars(el); }, delay + 350);
      Array.prototype.forEach.call(el.querySelectorAll('.skill-bar-label span:last-child'), function (s, i) {
        countUp(s, delay + 350 + i * 70);
      });
    }
    var chain = el.querySelector('.fx-chain');
    if (chain) {
      extra = chain.children.length * 170 + 600;
      setTimeout(function () { chain.classList.add('fx-play'); }, delay + 380);
      setTimeout(function () { chain.classList.add('fx-played'); }, delay + 380 + extra);
    }
    var rows = el.querySelectorAll('tbody tr, .wu-references li, li.ref-category').length;
    if (el.matches('.wu-mitre-table, .wu-references')) extra = Math.max(extra, rows * 90 + 700);

    // Once it has arrived the animation is dropped, so hover effects work again.
    setTimeout(function () { el.classList.add('fx-done'); }, delay + 1400 + extra);
  }

  var queue = [], flushTimer = 0;
  function flush() {
    flushTimer = 0;
    var batch = queue.splice(0).filter(function (el) { return !el.classList.contains('fx-in'); });
    batch.sort(function (a, b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return Math.abs(ra.top - rb.top) > 24 ? ra.top - rb.top : ra.left - rb.left;
    });
    // Scene parts keep their own clock. A part that only scrolls into view
    // later starts as soon as it is seen, never before its slot.
    var now = performance.now(), lastIn = new Map();   // spacing only counts within one batch
    batch.filter(function (el) { return sceneOf.has(el); })
      .sort(function (a, b) { return sceneOf.get(a).order - sceneOf.get(b).order; })
      .forEach(function (el) {
        var step = sceneOf.get(el), sc = step.scene;
        if (!sc.t0) sc.t0 = now;
        var start = Math.max(now, sc.t0 + step.at, (lastIn.get(sc) || 0) + step.gap);
        lastIn.set(sc, start);
        enter(el, Math.round(start - now));
      });
    batch.filter(function (el) { return !sceneOf.has(el); })
      .forEach(function (el, i) { enter(el, Math.min(i, 10) * 85); });
  }
  function schedule() {
    if (flushTimer) return;
    // during a cube turn the arriving components wait until the face is nearly round
    flushTimer = setTimeout(flush, Math.max(0, FX.holdUntil - performance.now()) + 30);
  }
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      seen.unobserve(en.target);
      queue.push(en.target);
    });
    schedule();
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { seen.observe(el); });

  // Safety net: anything on screen that is still waiting gets shown.
  setInterval(function () {
    if (performance.now() < FX.holdUntil) return;
    var vh = window.innerHeight;
    items.forEach(function (el) {
      if (el.classList.contains('fx-in') || queue.indexOf(el) > -1) return;
      var r = el.getBoundingClientRect();
      if (r.width && r.bottom > 0 && r.top < vh * 0.94) { queue.push(el); schedule(); }
    });
  }, 900);

  // ----- homepage hero: arc-reactor rings and a decoded name -----
  var hero = document.getElementById('hero');
  if (hero) {
    var reactor = document.createElement('div');
    reactor.className = 'fx-reactor';
    reactor.setAttribute('aria-hidden', 'true');
    reactor.innerHTML = '<i></i><i></i><i></i><i></i>';
    hero.insertBefore(reactor, hero.firstChild);
    var name = hero.querySelector('.hero-name');
    if (name) decode(name, Math.max(350, FX.holdUntil - performance.now() + 150));
  }

  // ----- a writeup: reading progress line under the nav -----
  if (document.querySelector('.wu-body')) {
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var paint = function () {
      var max = html.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    };
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  }

  // =====================================================================
  // 2 + 3. Cube turns
  // =====================================================================
  var OPPOSITE = { right: 'left', left: 'right', top: 'bottom', bottom: 'top' };
  // The side each homepage section arrives from when moving down the page.
  var SIDE = { hero: 'top', about: 'right', skills: 'bottom', experience: 'left', certificates: 'right',
               education: 'bottom', roadmap: 'left', writeups: 'right', contact: 'bottom' };
  var turning = false, queued = null;

  function sectionAt(y) {
    var found = null;
    Array.prototype.forEach.call(document.querySelectorAll('body > section[id]'), function (s) {
      if (s.getBoundingClientRect().top + window.scrollY <= y + window.innerHeight * 0.4) found = s;
    });
    return found;
  }

  // Returns false when the browser should handle the link itself.
  function turnToSection(target, hash) {
    if (!document.startViewTransition) return false;
    var from = window.scrollY;
    var max = html.scrollHeight - window.innerHeight;
    var to = Math.max(0, Math.min(max, Math.round(target.getBoundingClientRect().top + from)));
    if (turning) { queued = [target, hash]; return true; }   // the last click during a turn wins
    if (Math.abs(to - from) < 8) return true;

    var here = sectionAt(from), dir;
    if (to > from) dir = SIDE[target.id] || 'right';
    else dir = OPPOSITE[(here && SIDE[here.id]) || 'right'];

    turning = true;
    html.dataset.cube = dir;
    FX.holdUntil = performance.now() + FX.turn * SCENE_HOLD;
    FX.log.push('turn:' + dir + ':' + target.id);
    var vt = document.startViewTransition(function () {
      window.scrollTo({ top: to, behavior: 'instant' });
    });
    vt.ready.then(FX.measure, function () { /* transition skipped */ });
    history.pushState(null, '', hash);
    vt.finished.finally(function () {
      delete html.dataset.cube;
      turning = false;
      FX.log.push('done');
      if (queued) { var next = queued; queued = null; turnToSection(next[0], next[1]); }
    });
    return true;
  }

  // 0 = homepage, 1 = writeups list, 2 = one writeup
  function depth(path) {
    var m = /\/writeups\/(.*)$/.exec(path);
    if (!m) return 0;
    return m[1].replace(/index\.html$/, '') === '' ? 1 : 2;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;

    var samePage = url.pathname === location.pathname && url.search === location.search;
    if (samePage) {
      if (url.hash.length < 2) return;
      var target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target && turnToSection(target, url.hash)) e.preventDefault();
      return;
    }
    if (url.pathname === location.pathname) return;

    // Another page: deeper pages arrive from below or the right, going back up
    // the site comes from the top or the left. The next page reads this.
    var a0 = depth(location.pathname), b0 = depth(url.pathname), dir;
    if (b0 > a0) dir = b0 === 1 ? 'bottom' : 'right';
    else if (b0 < a0) dir = b0 === 0 ? 'top' : 'left';
    else dir = 'right';
    try { sessionStorage.setItem('fxDir', dir); } catch (err) { /* ignore */ }
    FX.log.push('leave:' + dir);
  });
})();
