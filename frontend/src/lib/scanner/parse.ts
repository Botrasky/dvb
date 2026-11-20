import type { ParsedInput } from "./types.ts";
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const CONTROL = /[\u0000-\u001f\u007f]/u;
/** Parse without contacting the provided URL. Never store the raw input. */
export function parseInput(value: string): ParsedInput {
  if (typeof value !== "string" || !value.trim())
    throw new Error("Enter a URL or domain.");
  if (value.length > 8192)
    throw new Error("URL exceeds the 8,192-character limit.");
  const input = value.trim();
  if (CONTROL.test(input))
    throw new Error("URL contains unsupported characters.");
  const explicit = SCHEME.test(input);
  if (
    !explicit &&
    (/\s/.test(input) || /^[^/]*@/.test(input) || input.startsWith("//"))
  ) {
    throw new Error("Enter a valid domain or complete HTTP(S) URL.");
  }
  let url: URL;
  try {
    url = new URL(explicit ? input : `https://${input}`);
  } catch {
    throw new Error("Enter a valid URL or domain.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("Only HTTP(S) URLs are supported.");
  if (!url.hostname || /\s/.test(url.hostname))
    throw new Error("URL hostname is invalid.");

  // Extract raw pre-normalized hostname before URL punycode normalization
  let raw = explicit ? input.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "") : input;
  raw = raw.split(/[/?#]/)[0];
  if (raw.includes("@")) {
    raw = raw.split("@").pop()!;
  }
  let rawHostname = raw;
  if (rawHostname.startsWith("[") && rawHostname.includes("]")) {
    rawHostname = rawHostname.slice(1, rawHostname.indexOf("]"));
  } else if (rawHostname.includes(":")) {
    rawHostname = rawHostname.split(":")[0];
  }

  return {
    inputKind: explicit ? "complete-url" : "domain-only",
    url,
    rawHostname,
    assumedScheme: !explicit,
  };
}
