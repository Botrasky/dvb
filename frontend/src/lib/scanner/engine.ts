import { pslDomainParser } from "./domainParser.ts";
import { analyzeScripts } from "./homograph.ts";
import { confusableSkeleton } from "./unicode.ts";
import { parseInput } from "./parse.ts";
import { redactUrl } from "./redact.ts";
import { DEMO_RULES, validateRules } from "./rules.ts";
import type {
  Category,
  DomainParser,
  Finding,
  ScannerRules,
  ScanResult,
} from "./types.ts";

export const ENGINE_VERSION = "0.1.0";
export const SCORING_VERSION = "PROPOSAL-1-not-calibrated";
/** All values require owner approval and a false-positive validation corpus. */
export const CAPS: Readonly<Record<Category, number>> = {
  "brand-impersonation": 30,
  "suspicious-characters": 25,
  "ip-and-port": 15,
  shortener: 10,
  "https-and-credentials": 15,
  "phishing-keywords": 5,
};
const CATEGORIES = Object.keys(CAPS) as Category[];
const LIMITATIONS = [
  "URL structure only; destination content, redirects, DNS, TLS certificates and live reputation were not checked.",
  "A low score does not establish that a site is safe.",
  "Scores and labels are provisional and require calibration before release.",
];
function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    mistakes = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++mistakes > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return mistakes + (a.length - i) + (b.length - j) <= 1;
}
function label(score: number): string {
  if (score === 0)
    return "No suspicious URL patterns identified (not a safety verdict)";
  if (score < 20) return "Low observed concern (provisional)";
  if (score < 40) return "Some concerning indicators (provisional)";
  if (score < 60) return "Caution (provisional)";
  if (score < 80) return "High observed concern (provisional)";
  return "Very high observed concern (provisional)";
}
/**
 * Scan using an injected, maintained Public Suffix List parser.
 * No URL fetches, redirects, storage, logs, dynamic rule execution or analytics.
 * Never feed raw input to UI/reporting code; use only returned redacted data.
 */
export function scanUrl(
  input: string,
  resolveDomain: DomainParser = pslDomainParser,
  rawRules: unknown = DEMO_RULES,
): ScanResult {
  const parsed = parseInput(input);
  const rules: ScannerRules = validateRules(rawRules);
  const { url, rawHostname } = parsed;
  const hostname = url.hostname.toLowerCase();
  const hostInfo = resolveDomain(hostname);
  const registrableDomain = hostInfo.domain?.toLowerCase() ?? null;
  const coverage: ScanResult["coverage"] = CATEGORIES.map((id) => ({
    id,
    status: "completed",
  }));
  const findings: Finding[] = [];
  const add = (
    category: Category,
    ruleId: string,
    points: number,
    severity: Finding["severity"],
    redactedEvidence: string,
    explanation: string,
    recommendation: string,
  ) => {
    findings.push({
      ruleId,
      category,
      severity,
      scoreContribution: points,
      categoryCap: CAPS[category],
      redactedEvidence,
      explanation,
      recommendation,
    });
  };
  const hostIsIp = hostInfo.isIp;
  if (!registrableDomain && !hostIsIp) {
    coverage.find((c) => c.id === "brand-impersonation")!.status =
      "unavailable";
  }
  // URL.hostname is IDNA/Punycode normalized; inspect rawHostname for script analysis.
  // Full Unicode checks need a reviewed UTS#39 confusables library and reliable decoding
  // before claiming completion. Non-ASCII or mixed-script detection does not generate findings
  // or add points here, keeping coverage unavailable and score null.
  const scriptInfo = analyzeScripts(rawHostname);
  void scriptInfo;
  coverage.find((c) => c.id === "suspicious-characters")!.status =
    "unavailable";
  if (hostIsIp)
    add(
      "ip-and-port",
      "literal-ip",
      9,
      "medium",
      "[IP hostname]",
      "The URL uses a literal IP address rather than a domain name.",
      "Verify the service through a known, trusted channel.",
    );
  if (url.port && !["80", "443"].includes(url.port))
    add(
      "ip-and-port",
      "unusual-port",
      6,
      "low",
      "[non-standard port]",
      "An explicit nonstandard network port is present.",
      "Confirm that the port belongs to the expected service.",
    );
  if (registrableDomain && rules.shorteners.includes(registrableDomain))
    add(
      "shortener",
      "url-shortener",
      10,
      "medium",
      registrableDomain,
      "A shortener hides the final destination, which was not visited.",
      "Ask the sender for the full destination or verify independently.",
    );
  if (!parsed.assumedScheme && url.protocol === "http:")
    add(
      "https-and-credentials",
      "insecure-http",
      3,
      "low",
      "http:",
      "The submitted URL uses HTTP; website trust is not otherwise established.",
      "Never submit sensitive information over HTTP.",
    );
  if (url.username || url.password)
    add(
      "https-and-credentials",
      "url-userinfo",
      14,
      "high",
      "[REDACTED]@" + hostname,
      "User information appears before the actual hostname and may disguise the destination.",
      "Check the real hostname after the @ sign.",
    );
  const longOrExcessive =
    [...url.searchParams].length > 12 ||
    [...url.searchParams].some(([, v]) => v.length > 500);
  if (longOrExcessive)
    add(
      "phishing-keywords",
      "query-complexity",
      2,
      "info",
      "[QUERY REDACTED]",
      "The URL contains many or unusually long query parameters.",
      "Treat this as a weak indicator; many legitimate websites have long queries.",
    );
  const embeddedDest = [...url.searchParams].some(
    ([key, v]) =>
      /^(?:url|redirect|next|return|continue|destination)$/i.test(key) &&
      /^https?:\/\//i.test(v),
  );
  if (embeddedDest)
    add(
      "phishing-keywords",
      "embedded-destination",
      3,
      "low",
      "[QUERY REDACTED]",
      "A query parameter embeds another destination, which was not followed.",
      "Confirm the intended destination independently.",
    );
  const pathWords = url.pathname
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
  const matches = [
    ...new Set(pathWords.filter((word) => rules.keywords.includes(word))),
  ];
  if (matches.length >= 2)
    add(
      "phishing-keywords",
      "keyword-combination",
      3,
      "low",
      "[path omitted]",
      "Multiple account-related terms appear in the path.",
      "Keywords alone are not evidence of phishing.",
    );

  if (registrableDomain) {
    const firstLabel = registrableDomain.split(".")[0];
    const skel = confusableSkeleton(firstLabel);
    for (const brand of rules.brands) {
      const official = brand.domains.map((d) => d.toLowerCase());
      if (official.includes(registrableDomain)) continue;
      if (official.some((d) => hostname.endsWith("." + d))) continue;
      const officialLabels = official.map((d) => d.split(".")[0]);
      if (
        officialLabels.some(
          (name) =>
            (firstLabel !== name && skel === confusableSkeleton(name)) ||
            (editDistanceAtMostOne(firstLabel, name) && firstLabel !== name),
        )
      ) {
        add(
          "brand-impersonation",
          `brand-lookalike-${brand.id}`,
          20,
          "high",
          registrableDomain,
          `The registrable domain resembles the name of ${brand.name}, but is not in its reviewed domain inventory.`,
          "Find the organization using a trusted bookmark or independently entered address.",
        );
      } else if (
        officialLabels.some((name) =>
          hostname.split(".").slice(0, -1).includes(name),
        ) &&
        !official.includes(registrableDomain)
      ) {
        add(
          "brand-impersonation",
          `brand-subdomain-${brand.id}`,
          18,
          "high",
          registrableDomain,
          `${brand.name} appears in a hostname label while the actual registrable domain differs.`,
          "Verify the registrable domain, not merely the visible brand name.",
        );
      }
    }
  }
  // Group duplicate / related evidence by category; retain at most the two strongest findings.
  const sorted = [...findings].sort(
    (a, b) => b.scoreContribution - a.scoreContribution,
  );
  const totals = new Map<Category, number>();
  const selected: Finding[] = [];
  for (const finding of sorted) {
    const allocated = totals.get(finding.category) ?? 0;
    const remaining = CAPS[finding.category] - allocated;
    const count = selected.filter(
      (f) => f.category === finding.category,
    ).length;
    if (remaining <= 0 || count >= 2) continue;
    finding.scoreContribution = Math.min(remaining, finding.scoreContribution);
    totals.set(finding.category, allocated + finding.scoreContribution);
    selected.push(finding);
  }
  const partial = coverage.some((c) => c.status !== "completed");
  const risk = selected.reduce((sum, f) => sum + f.scoreContribution, 0);
  return {
    inputKind: parsed.inputKind,
    redactedDisplayUrl: redactUrl(parsed),
    registrableDomain,
    scannedAt: new Date().toISOString(),
    score: partial ? null : Math.max(0, Math.min(100, risk)),
    label: partial ? "Partial Analysis — risk score unavailable" : label(risk),
    coverage,
    findings: selected,
    engineVersion: ENGINE_VERSION,
    scoringVersion: SCORING_VERSION,
    rulesVersion: rules.version,
    rulesUpdatedAt: rules.updatedAt,
    isPartial: partial,
    limitations: [
      ...LIMITATIONS,
      ...(parsed.assumedScheme
        ? ["The URL scheme was not supplied; HTTPS was not verified."]
        : []),
    ],
  };
}
