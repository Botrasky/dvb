const publishers = [
  { name: 'NIST', kind: 'Standards & guidance', feed: 'https://www.nist.gov/blogs/cybersecurity-insights/rss.xml', hosts: ['csrc.nist.gov', 'www.nist.gov'] },
  { name: 'Cloud Security Alliance', kind: 'Cloud security', feed: 'https://cloudsecurityalliance.org/feed/', hosts: ['cloudsecurityalliance.org'] },
  { name: 'Cloudflare', kind: 'Security research', feed: 'https://blog.cloudflare.com/tag/security/rss/', hosts: ['blog.cloudflare.com'] },
];

const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, key) => {
    if (Object.hasOwn(entities, key)) return entities[key];
    if (!key.startsWith('#')) return entity;
    const code = key[1].toLowerCase() === 'x' ? parseInt(key.slice(2), 16) : Number(key.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : '';
  });
}

function field(item, name) {
  return (item.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i'))?.[1] || '')
    .trim().replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1');
}

function plainText(value, limit) {
  const text = decode(decode(value)).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  const excerpt = text.slice(0, limit - 1);
  const cut = excerpt.lastIndexOf(' ');
  return (cut > limit * .75 ? excerpt.slice(0, cut) : excerpt) + '…';
}

function sourceLink(value, publisher) {
  if (!value) return '';
  try {
    const url = new URL(decode(value), publisher.feed);
    return url.protocol === 'https:' && !url.username && !url.password && publisher.hosts.includes(url.hostname)
      ? url.href : '';
  } catch {
    return '';
  }
}

export function parseFeed(xml, publisher) {
  const items = [];
  for (const [, item] of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const title = plainText(field(item, 'title'), 165);
    const url = sourceLink(field(item, 'link'), publisher);
    const date = Date.parse(plainText(field(item, 'pubDate') || field(item, 'dc:date'), 80));
    if (!title || !url || !Number.isFinite(date)) continue;
    items.push({ title, url, date: new Date(date).toISOString(), source: publisher.name,
      kind: publisher.kind, summary: plainText(field(item, 'description'), 165) });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
}

async function readPublisher(publisher) {
  const response = await fetch(publisher.feed, {
    signal: AbortSignal.timeout(4500),
    headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return xml.length <= 1_200_000 ? parseFeed(xml, publisher) : [];
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    const results = await Promise.allSettled(publishers.map(readPublisher));
    const groups = results.map(result => result.status === 'fulfilled' ? result.value : []);
    const items = [];
    const seen = new Set();
    for (let index = 0; index < 3; index++) {
      const round = groups.map(group => group[index]).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
      for (const item of round) {
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        items.push(item);
      }
    }
    const sources = groups.filter(group => group.length).length;
    return Response.json({ items, sources }, {
      status: items.length ? 200 : 503,
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': sources === publishers.length ? 'public, s-maxage=1800, stale-while-revalidate=3600' : 'public, s-maxage=120',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
