import type { ScannerRules } from "./types.ts";
const SAFE_LABEL = /^[a-z0-9][a-z0-9.-]{0,252}$/i;
const RULE_ID = /^[a-z][a-z0-9-]{1,63}$/;
/** Validate untrusted JSON as data; unknown keys and executable expressions are rejected. */
export function validateRules(value: unknown): ScannerRules {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid ruleset.");
  const o = value as Record<string, unknown>;
  strictKeys(o, [
    "schemaVersion",
    "version",
    "updatedAt",
    "shorteners",
    "brands",
    "keywords",
  ]);
  if (
    o.schemaVersion !== 1 ||
    typeof o.version !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(o.version) ||
    typeof o.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(o.updatedAt))
  )
    throw new Error("Unsupported rules version.");
  if (
    !Array.isArray(o.shorteners) ||
    o.shorteners.length > 200 ||
    !o.shorteners.every((s) => typeof s === "string" && SAFE_LABEL.test(s))
  )
    throw new Error("Invalid shorteners.");
  if (
    !Array.isArray(o.keywords) ||
    o.keywords.length > 100 ||
    !o.keywords.every((s) => typeof s === "string" && /^[a-z]{3,24}$/.test(s))
  )
    throw new Error("Invalid keywords.");
  if (!Array.isArray(o.brands) || o.brands.length > 200)
    throw new Error("Invalid brand inventory.");
  for (const entry of o.brands) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry))
      throw new Error("Invalid brand entry.");
    const b = entry as Record<string, unknown>;
    strictKeys(b, ["id", "name", "domains"]);
    if (
      typeof b.id !== "string" ||
      !RULE_ID.test(b.id) ||
      typeof b.name !== "string" ||
      b.name.length > 80 ||
      !Array.isArray(b.domains) ||
      b.domains.length > 30 ||
      !b.domains.every((s) => typeof s === "string" && SAFE_LABEL.test(s))
    )
      throw new Error("Invalid brand entry.");
  }
  return o as unknown as ScannerRules;
}
function strictKeys(o: Record<string, unknown>, keys: string[]) {
  if (
    Object.keys(o).some((k) => !keys.includes(k)) ||
    keys.some((k) => !(k in o))
  )
    throw new Error("Unexpected ruleset fields.");
}
/** Development-only examples; production inventory requires owner verification. */
export const DEMO_RULES: ScannerRules = validateRules({
  schemaVersion: 1,
  version: "0.1.0",
  updatedAt: "2026-11-16T00:00:00Z",
  shorteners: ["bit.ly", "tinyurl.com", "t.co", "is.gd"],
  brands: [{ id: "example", name: "Example", domains: ["example.com"] }],
  keywords: [
    "verify",
    "urgent",
    "login",
    "reset",
    "account",
    "suspend",
    "password",
  ],
});
