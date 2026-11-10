import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const output = ".vercel/output";
const staticRoot = join(output, "static");
const config = JSON.parse(readFileSync(join(output, "config.json"), "utf8"));
const { default: handler } = await import(
  `../${output}/functions/_render.func/dist/server/entry.mjs`
);
const dynamicPaths = ["/", "/author/", "/portfolio/", "/writeups/"];
const knownRoutes = new Set([...dynamicPaths, "/api/security-brief/"]);
const problems = [];
const pages = [];

for (const path of dynamicPaths) {
  const response = await handler.fetch(
    new Request(`https://example.test${path}`),
  );
  if (
    response.status !== 200 ||
    !response.headers.get("content-type")?.includes("text/html")
  ) {
    problems.push(`${path}: expected an HTML 200, got ${response.status}`);
    continue;
  }
  pages.push({ path, html: await response.text() });
}

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const file = join(directory, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (file.endsWith(".html")) {
      pages.push({
        path: `/${relative(staticRoot, file).replace(/index\.html$/, "")}`,
        html: readFileSync(file, "utf8"),
      });
    }
  }
}
walk(staticRoot);
for (const page of pages) knownRoutes.add(page.path);

for (const { path, html } of pages) {
  const base = html.match(/<base\s+href="([^"]+)"/)?.[1] || path;
  for (const [, attribute, reference] of html.matchAll(
    /\b(href|src)="([^"]+)"/g,
  )) {
    if (/^(?:mailto:|tel:|data:|javascript:)/.test(reference)) continue;
    const url = new URL(reference, `https://example.test${base}`);
    if (url.host !== "example.test") continue;
    const target = url.pathname;
    if (
      knownRoutes.has(target) ||
      existsSync(join(staticRoot, target)) ||
      existsSync(join(staticRoot, target, "index.html"))
    )
      continue;
    problems.push(
      `${path}: ${attribute}="${reference}" resolves to missing ${target}`,
    );
  }
}

for (const path of knownRoutes) {
  if (path === "/") continue;
  const route = config.routes.find(
    (entry) => entry.dest === "_render" && entry.src === `^${path}$`,
  );
  if (!route && !existsSync(join(staticRoot, path, "index.html")))
    problems.push(`${path}: no Vercel route or static page`);
  const withoutSlash = path.slice(0, -1);
  const redirect = config.routes.find(
    (entry) => entry.status === 308 && new RegExp(entry.src).test(withoutSlash),
  );
  if (!redirect || redirect.headers?.Location !== "/$1/")
    problems.push(`${withoutSlash}: missing redirect to slash route`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Route check passed: ${pages.length} HTML pages, local links and assets, Vercel slash routes.`,
  );
}
