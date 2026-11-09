(() => {
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  const slide = document.getElementById('brief-slide');
  if (!slide) return;

  const picks = [
    {
      source: 'NIST', kind: 'Standards', title: 'NIST Cybersecurity Framework 2.0',
      summary: 'Start with the framework behind many cybersecurity programs. It covers how to govern, identify, protect, detect, respond, and recover.',
      url: 'https://www.nist.gov/publications/nist-cybersecurity-framework-csf-20',
    },
    {
      source: 'Cloud Security Alliance', kind: 'Cloud security', title: 'AI governance as an architecture problem',
      summary: 'A look at how teams can build governance into the systems they use for AI.',
      url: 'https://cloudsecurityalliance.org/articles/ai-governance-isn-t-a-chore-problem-it-s-an-architecture-problem',
    },
    {
      source: 'Cloudflare', kind: 'Security research', title: 'The post-quantum future of web privacy',
      summary: 'How post-quantum cryptography could help protect the privacy protocols that websites use to prevent abuse.',
      url: 'https://blog.cloudflare.com/vole-mole/',
    },
    {
      source: 'NVD', kind: 'Vulnerability database', title: 'Browse the National Vulnerability Database',
      summary: 'Look up published vulnerabilities, their severity scores, and links to advisories.',
      url: 'https://nvd.nist.gov/vuln/search',
    },
    {
      source: 'The Hacker News', kind: 'Threat news', title: 'Latest from The Hacker News',
      summary: 'Find reporting on new threats, security flaws, and cyberattacks.',
      url: 'https://thehackernews.com/',
    },
    {
      source: 'BleepingComputer', kind: 'Incidents & patches', title: 'BleepingComputer security news',
      summary: 'Follow security incidents, malware campaigns, and patch releases.',
      url: 'https://www.bleepingcomputer.com/news/security/',
    },
  ];
  const publishers = new Map([
    ['NIST', ['nist', 'NIST']],
    ['Cloud Security Alliance', ['csa', 'CSA']],
    ['Cloudflare', ['cloudflare', 'CF']],
    ['NVD', ['nvd', 'NVD']],
    ['The Hacker News', ['thn', 'THN']],
    ['BleepingComputer', ['bc', 'BC']],
  ]);
  const thumb = document.getElementById('brief-thumb');
  const thumbLabel = document.getElementById('brief-thumb-label');
  const thumbImage = document.getElementById('brief-thumb-image');
  const source = document.getElementById('brief-source');
  const headline = document.getElementById('brief-headline');
  const summary = document.getElementById('brief-summary');
  const original = document.getElementById('brief-link');
  const counter = document.getElementById('brief-counter');
  const status = document.getElementById('brief-state');
  const play = document.getElementById('brief-play');
  const dateFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  let stories = picks;
  let active = 0;
  let interacted = false;
  let timer = null;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let playing = !reducedMotion.matches && !document.hidden;
  let typingVersion = 0;

  function renderThumbnail(story) {
    const [style, label] = publishers.get(story.source) || ['unknown', 'NEWS'];
    thumb.dataset.publisher = style;
    thumbLabel.textContent = label;
    thumbImage.replaceChildren();
    if (typeof story.image !== 'string' || !story.image.startsWith('https://')) return;
    const image = document.createElement('img');
    image.alt = '';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('load', () => image.classList.add('is-ready'), { once: true });
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = story.image;
    thumbImage.append(image);
  }

  function render(animate = false) {
    stopTyping();
    const story = stories[active];
    const date = Date.parse(story.date);
    const byline = Number.isFinite(date) ? [story.source, story.kind, dateFormat.format(date)] : [story.source, story.kind];
    source.textContent = byline.join(' · ');
    headline.textContent = story.title;
    summary.textContent = story.summary || 'Open the original story for the full update.';
    original.href = story.url;
    renderThumbnail(story);
    renderCounter();
    if (playing) typeStory();
    if (animate) {
      slide.classList.remove('is-changing');
      void slide.offsetWidth;
      slide.classList.add('is-changing');
    }
  }

  function renderCounter() {
    counter.textContent = [active + 1, stories.length].map(value => String(value).padStart(2, '0')).join(' / ');
  }

  function advance(offset) {
    interacted = true;
    active = (active + offset + stories.length) % stories.length;
    render(true);
  }

  function stopTyping() {
    clearTimeout(timer);
    timer = null;
    typingVersion++;
    [headline, summary].forEach(el => {
      if (el.dataset.fullText !== undefined) {
        el.textContent = el.dataset.fullText;
        delete el.dataset.fullText;
      }
      el.classList.remove('brief-typing');
    });
  }

  function updatePlayback() {
    slide.setAttribute('aria-live', playing ? 'off' : 'polite');
    play.textContent = playing ? 'Pause' : 'Play';
    play.setAttribute('aria-label', playing ? 'Pause slideshow' : 'Play slideshow');
  }

  function typeStory() {
    updatePlayback();
    const version = typingVersion;
    const fields = [headline, summary].map(el => {
      const full = el.textContent;
      el.dataset.fullText = full;
      el.classList.add('brief-typing');
      const layout = document.createElement('span');
      layout.className = 'brief-text-full';
      layout.textContent = full;
      const ink = document.createElement('span');
      ink.className = 'brief-text-ink';
      ink.setAttribute('aria-hidden', 'true');
      el.replaceChildren(layout, ink);
      const chars = typeof Intl.Segmenter === 'function'
        ? [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(full)].map(part => part.segment)
        : Array.from(full);
      return { el, ink, chars };
    });
    let field = 0, cursor = 0;
    function tick() {
      if (!playing || version !== typingVersion) return;
      const current = fields[field];
      cursor = Math.min(cursor + 2, current.chars.length);
      current.ink.textContent = current.chars.slice(0, cursor).join('');
      if (cursor < current.chars.length) {
        timer = setTimeout(tick, 28);
      } else if (++field < fields.length) {
        cursor = 0;
        timer = setTimeout(tick, 180);
      } else {
        stopTyping();
        // Keep the completed story readable before moving to another publisher.
        timer = setTimeout(() => {
          const currentSource = stories[active].source;
          let offset = 1;
          while (offset < stories.length && stories[(active + offset) % stories.length].source === currentSource) offset++;
          advance(offset);
        }, 4500);
      }
    }
    tick();
  }

  function pause() {
    playing = false;
    stopTyping();
    updatePlayback();
  }

  play.addEventListener('click', () => {
    interacted = true;
    if (playing) return pause();
    playing = true;
    if (reducedMotion.matches) {
      // Explicit playback is allowed, but avoid the character animation.
      updatePlayback();
      timer = setTimeout(() => { pause(); advance(1); }, 8000);
    } else render();
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) pause(); });
  slide.addEventListener('focusin', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  document.getElementById('brief-prev').addEventListener('click', () => { pause(); advance(-1); });
  document.getElementById('brief-next').addEventListener('click', () => { pause(); advance(1); });
  document.getElementById('brief-controls').hidden = false;
  render();

  fetch('/api/security-brief', { signal: AbortSignal.timeout(7000) })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data) return;
      const fresh = (Array.isArray(data.items) ? data.items : []).filter(item =>
        item && typeof item.title === 'string' && typeof item.url === 'string' && item.url.startsWith('https://'));
      if (!fresh.length) return;
      const nextStories = [...fresh];
      const missing = picks.filter(pick => !fresh.some(story => story.source === pick.source));
      nextStories.push(...missing);

      if (interacted || slide.contains(document.activeElement)) {
        const current = stories[active];
        active = nextStories.findIndex(story => story.url === current.url);
        if (active < 0) {
          // Keep the displayed pick until the reader moves to another story.
          active = nextStories.findIndex(story => story.source === current.source);
          nextStories[active] = current;
          status.textContent = 'News & suggested reading';
        } else {
          status.textContent = missing.length ? 'News & suggested reading' : 'Publisher feeds';
        }
        stories = nextStories;
        renderCounter();
        return;
      }
      stories = nextStories;
      status.textContent = missing.length ? 'News & suggested reading' : 'Publisher feeds';
      render();
    })
    .catch(() => { /* Keep the labeled source picks if the feed cannot load. */ });
})();
