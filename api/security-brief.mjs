const maxPerPublisher = 2;

const publishers = [
  { name: 'NIST', kind: 'Standards & guidance', feed: 'https://www.nist.gov/blogs/cybersecurity-insights/rss.xml', hosts: ['csrc.nist.gov', 'www.nist.gov'], imageHosts: ['www.nist.gov'] },
  { name: 'Cloud Security Alliance', kind: 'Cloud security', feed: 'https://cloudsecurityalliance.org/feed/', hosts: ['cloudsecurityalliance.org'], imageHosts: ['cloudsecurityalliance.org'] },
  { name: 'Cloudflare', kind: 'Security research', feed: 'https://blog.cloudflare.com/tag/security/rss/', hosts: ['blog.cloudflare.com'], imageHosts: ['blog.cloudflare.com', 'cf-assets.www.cloudflare.com'] },
  { name: 'Palo Alto Unit 42', kind: 'Threat intelligence', feed: 'https://unit42.paloaltonetworks.com/feed/', hosts: ['unit42.paloaltonetworks.com'], imageHosts: ['unit42.paloaltonetworks.com'] },
  { name: 'IBM Research', kind: 'Security research', feed: 'https://research.ibm.com/rss', hosts: ['research.ibm.com'], imageHosts: ['research.ibm.com', 'assets.ibm.com'], match: /security|cyber|vulnerab|privacy|cryptograph|zero[ -]trust|threat|malware|ransomware|attack|identity|authentication|quantum-safe|post-quantum/i },
  { name: 'The Hacker News', kind: 'Threat news', feed: 'https://feeds.feedburner.com/TheHackersNews', hosts: ['thehackernews.com', 'www.thehackernews.com'], imageHosts: ['blogger.googleusercontent.com', 'blogspot.com', 'thehackernews.com', 'www.thehackernews.com'] },
  { name: 'BleepingComputer', kind: 'Incidents & patches', feed: 'https://www.bleepingcomputer.com/feed/', hosts: ['www.bleepingcomputer.com', 'bleepingcomputer.com'], imageHosts: ['www.bleepingcomputer.com', 'www.bleepstatic.com'], pathPrefix: '/news/security/' },
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
    const validHost = url.protocol === 'https:' && !url.username && !url.password && publisher.hosts.includes(url.hostname);
    const validPath = !publisher.pathPrefix || url.pathname.startsWith(publisher.pathPrefix);
    return validHost && validPath ? url.href : '';
  } catch {
    return '';
  }
}

function thumbnail(item, publisher) {
  const imagePublisher = { ...publisher, hosts: publisher.imageHosts || publisher.hosts, pathPrefix: '' };
  const direct = sourceLink(field(item, 'featuredImage'), imagePublisher);
  if (direct) return direct;
  const imageTags = item.matchAll(/<(enclosure|media:thumbnail|media:content)\b([^>]*?)\/?>/gi);
  for (const [, tag, attributes] of imageTags) {
    const type = attributes.match(/\btype\s*=\s*(['"])(.*?)\1/i)?.[2] || '';
    const medium = attributes.match(/\bmedium\s*=\s*(['"])(.*?)\1/i)?.[2] || '';
    const candidate = attributes.match(/(?:^|\s)url\s*=\s*(['"])(.*?)\1/i)?.[2];
    const url = sourceLink(candidate, imagePublisher);
    const isImage = /^image\/(?:png|jpe?g|webp|avif)$/i.test(type);
    const isThumbnail = !type && (tag.toLowerCase() === 'media:thumbnail' || medium.toLowerCase() === 'image');
    if (url && (isImage || isThumbnail)) return url;
  }
  const html = field(item, 'content:encoded') || field(item, 'description');
  for (const match of html.matchAll(/<img\b[^>]*?\bsrc\s*=\s*(['"])(.*?)\1/gi)) {
    const url = sourceLink(match[2], imagePublisher);
    if (url) return url;
  }
  return '';
}

export function parseFeed(xml, publisher) {
  const items = [];
  for (const [, item] of xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)) {
    const title = plainText(field(item, 'title'), 165);
    const rawDescription = field(item, 'description');
    if (publisher.match && !publisher.match.test(title + ' ' + plainText(rawDescription, 500))) continue;
    const url = sourceLink(field(item, 'feedburner:origLink'), publisher) || sourceLink(field(item, 'link'), publisher);
    const date = Date.parse(plainText(field(item, 'pubDate') || field(item, 'dc:date'), 80));
    if (!title || !url || !Number.isFinite(date)) continue;
    const image = thumbnail(item, publisher);
    items.push({ title, url, date: new Date(date).toISOString(), source: publisher.name,
      kind: publisher.kind, summary: plainText(rawDescription, 165), ...(image && { image }) });
  }
  return newest(items);
}

function newest(items) {
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, maxPerPublisher);
}

async function readNvd() {
  const now = new Date();
  const start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const url = new URL('https://services.nvd.nist.gov/rest/json/cves/2.0');
  url.search = new URLSearchParams({
    pubStartDate: start.toISOString(),
    pubEndDate: now.toISOString(),
    cvssV3Severity: 'CRITICAL',
  });
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5500),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return [];
  const { vulnerabilities } = await response.json();
  const items = [];
  for (const { cve } of vulnerabilities || []) {
    if (!cve || cve.vulnStatus === 'Rejected' || !/^CVE-\d{4}-\d{4,}$/.test(cve.id)) continue;
    const date = Date.parse(cve.published);
    if (!Number.isFinite(date)) continue;
    const description = cve.descriptions?.find(entry => entry.lang === 'en')?.value || '';
    items.push({
      source: 'NVD', kind: 'Critical vulnerability', title: cve.id,
      url: 'https://nvd.nist.gov/vuln/detail/' + cve.id,
      date: new Date(date).toISOString(), summary: plainText(description, 165),
    });
  }
  return newest(items);
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
    const results = await Promise.allSettled([...publishers.map(readPublisher), readNvd()]);
    const groups = results.map(result => result.status === 'fulfilled' ? result.value : []);
    const items = [];
    const seen = new Set();
    for (let index = 0; index < maxPerPublisher; index++) {
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
        'Vercel-CDN-Cache-Control': sources === groups.length ? 'public, s-maxage=1800, stale-while-revalidate=3600' : 'public, s-maxage=120',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  },
};
