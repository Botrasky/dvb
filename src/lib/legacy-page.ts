import { readFileSync, readdirSync, statSync } from "node:fs";

const root = process.cwd();

export function routeLegacyLinks(html: string) {
  return html
    .replaceAll('href="index.html"', 'href="/"')
    .replaceAll('href="writeups/index.html"', 'href="/writeups/"')
    .replaceAll('href="author.html"', 'href="/author/"')
    .replaceAll('href="about.html"', 'href="/portfolio/"')
    .replaceAll('href="../../about.html#contact"', 'href="/portfolio/#contact"')
    .replaceAll('href="../../about.html"', 'href="/portfolio/"')
    .replaceAll('href="../index.html"', 'href="/writeups/"')
    .replaceAll('href="../../index.html"', 'href="/"')
    .replaceAll('href="../css/', 'href="/css/')
    .replaceAll('href="../../css/', 'href="/css/')
    .replaceAll('src="../js/', 'src="/js/')
    .replaceAll('src="../../js/', 'src="/js/')
    .replaceAll('href="../assets/', 'href="/assets/')
    .replaceAll('href="../../assets/', 'href="/assets/')
    .replaceAll('src="../assets/', 'src="/assets/')
    .replaceAll('src="../../assets/', 'src="/assets/');
}

export function readLegacyPage(relativePath: string) {
  return routeLegacyLinks(readFileSync(`${root}/${relativePath}`, "utf8"));
}

export function writeupSlugs() {
  return readdirSync(`${root}/writeups`).filter((name) =>
    statSync(`${root}/writeups/${name}`).isDirectory(),
  );
}
