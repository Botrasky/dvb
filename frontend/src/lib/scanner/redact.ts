import type { ParsedInput } from "./types.ts";
const SENSITIVE_PATH =
  /(?:^[^@\s]+@[^@\s]+\.[^@\s]+$|^[A-Za-z0-9_=\-]{24,}$|\b(?:bearer|token|session|password|api[_-]?key)\b)/i;
/** Safe output deliberately removes *all* query values and all URL fragments. */
export function redactUrl(parsed: ParsedInput): string {
  const { url } = parsed;
  const host =
    url.hostname.includes(":") && !url.hostname.startsWith("[")
      ? `[${url.hostname}]`
      : url.hostname;
  const base = `${parsed.assumedScheme ? "(scheme not supplied) " : url.protocol + "//"}${host}${url.port ? ":" + url.port : ""}`;
  const segments = url.pathname.split("/").map((segment) => {
    try {
      return SENSITIVE_PATH.test(decodeURIComponent(segment))
        ? "[REDACTED]"
        : segment.slice(0, 100);
    } catch {
      return "[REDACTED]";
    }
  });
  // Query *names* can contain secrets too: do not emit them at all.
  const query = url.search ? "?[QUERY REDACTED]" : "";
  return `${base}${segments.join("/")}${query}${url.hash ? "#[FRAGMENT REDACTED]" : ""}`;
}
