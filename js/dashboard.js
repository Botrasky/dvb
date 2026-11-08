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
  ];
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

  function render(animate = false) {
    const story = stories[active];
    const date = Date.parse(story.date);
    const byline = Number.isFinite(date) ? [story.source, story.kind, dateFormat.format(date)] : [story.source, story.kind];
    source.textContent = byline.join(' · ');
    headline.textContent = story.title;
    summary.textContent = story.summary || 'Open the original story for the full update.';
    original.href = story.url;
    renderCounter();
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

  function pause() {
    if (timer === null) return;
    clearInterval(timer);
    timer = null;
    slide.setAttribute('aria-live', 'polite');
    play.textContent = 'Play';
    play.setAttribute('aria-label', 'Play slideshow');
  }

  play.addEventListener('click', () => {
    if (timer !== null) {
      pause();
      return;
    }
    interacted = true;
    slide.setAttribute('aria-live', 'off');
    play.textContent = 'Pause';
    play.setAttribute('aria-label', 'Pause slideshow');
    timer = setInterval(() => advance(1), 8000);
  });
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
      if (interacted || slide.contains(document.activeElement)) {
        stories = [...stories, ...fresh.filter(item => !stories.some(story => story.url === item.url))];
        status.textContent = 'Feed + source picks';
        renderCounter();
        return;
      }
      stories = [...fresh];
      for (const pick of picks) {
        if (!fresh.some(story => story.source === pick.source || story.url === pick.url)) stories.push(pick);
      }
      status.textContent = data.sources === picks.length ? 'From live feeds' : 'Feed + source picks';
      render();
    })
    .catch(() => { /* Keep the labeled source picks if the feed cannot load. */ });
})();
