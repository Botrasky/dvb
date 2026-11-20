const VIRUSTOTAL_URL = "https://www.virustotal.com/api/v3/urls/";
const MAX_URL_LENGTH = 8192;
const SENSITIVE_PARAMETER =
  /password|passwd|token|secret|api[_-]?key|session|auth|email/i;

function safeLabel(value) {
  if (typeof value !== "string") return null;
  const label = value.trim();
  return label.length > 0 &&
    label.length <= 80 &&
    /^[\p{L}\p{N} ._+()&-]+$/u.test(label)
    ? label
    : null;
}

function nonnegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function mapEvidence(attributes) {
  const communityReputation = Number.isSafeInteger(attributes.reputation)
    ? attributes.reputation
    : null;
  const votes = attributes.total_votes;
  const communityVotes =
    votes && typeof votes === "object"
      ? {
          harmless: nonnegativeInteger(votes.harmless),
          malicious: nonnegativeInteger(votes.malicious),
        }
      : null;
  const categories =
    attributes.categories &&
    typeof attributes.categories === "object" &&
    !Array.isArray(attributes.categories)
      ? Object.entries(attributes.categories)
          .slice(0, 12)
          .map(([source, category]) => ({
            source: safeLabel(source),
            category: safeLabel(category),
          }))
          .filter(({ source, category }) => source && category)
      : [];
  const targetedBrands =
    attributes.targeted_brand &&
    typeof attributes.targeted_brand === "object" &&
    !Array.isArray(attributes.targeted_brand)
      ? Object.keys(attributes.targeted_brand)
          .slice(0, 12)
          .map(safeLabel)
          .filter(Boolean)
      : [];
  const tags = Array.isArray(attributes.tags)
    ? attributes.tags.slice(0, 20).map(safeLabel).filter(Boolean)
    : [];
  const engines =
    attributes.last_analysis_results &&
    typeof attributes.last_analysis_results === "object" &&
    !Array.isArray(attributes.last_analysis_results)
      ? Object.entries(attributes.last_analysis_results)
          .slice(0, 200)
          .filter(
            ([, result]) =>
              result && ["malicious", "suspicious"].includes(result.category),
          )
          .slice(0, 20)
          .map(([name, result]) => ({
            engine: safeLabel(name),
            category: result.category,
            result: safeLabel(result.result),
          }))
          .filter(({ engine }) => engine)
      : [];
  return {
    communityReputation,
    communityVotes,
    timesSubmitted: nonnegativeInteger(attributes.times_submitted),
    categories,
    targetedBrands,
    tags,
    engines,
  };
}

export function normalizeLookupUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Enter a URL or domain.");
  }

  const input = value.trim();
  if (input.length > MAX_URL_LENGTH) {
    throw new Error("URL exceeds the 8,192-character limit.");
  }

  let url;
  try {
    url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(input) ? input : `https://${input}`,
    );
  } catch {
    throw new Error("Enter a valid HTTP(S) URL or domain.");
  }

  if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
    throw new Error("Only HTTP(S) URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error(
      "URLs containing embedded credentials cannot be cross-checked.",
    );
  }
  if (url.hash) {
    throw new Error(
      "URLs containing fragments cannot be cross-checked because they may contain private data.",
    );
  }
  if (
    [...url.searchParams.keys()].some((key) => SENSITIVE_PARAMETER.test(key))
  ) {
    throw new Error(
      "This URL appears to contain a sensitive query parameter and cannot be cross-checked.",
    );
  }

  return url.href;
}

/** Look up an existing VirusTotal URL report. Never submits the destination for crawling. */
export async function lookupVirusTotal(
  value,
  {
    apiKey = process.env.VIRUSTOTAL_API,
    fetchImpl = globalThis.fetch,
    now = () => new Date(),
  } = {},
) {
  const url = normalizeLookupUrl(value);
  const checkedAt = now().toISOString();
  if (!apiKey) {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "not_configured",
      checkedAt,
    };
  }

  const id = Buffer.from(url, "utf8").toString("base64url");
  let response;
  try {
    response = await fetchImpl(`${VIRUSTOTAL_URL}${encodeURIComponent(id)}`, {
      method: "GET",
      headers: { accept: "application/json", "x-apikey": apiKey },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "network_error",
      checkedAt,
    };
  }

  if (response.status === 404) {
    return { provider: "VirusTotal", status: "not_found", checkedAt };
  }
  if (response.status === 429) {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "rate_limited",
      checkedAt,
    };
  }
  if (!response.ok) {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "provider_error",
      checkedAt,
    };
  }

  let report;
  try {
    report = await response.json();
  } catch {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "invalid_response",
      checkedAt,
    };
  }

  const attributes = report?.data?.attributes;
  const rawStats = attributes?.last_analysis_stats;
  const statNames = [
    "malicious",
    "suspicious",
    "harmless",
    "undetected",
    "timeout",
    "confirmed-timeout",
    "failure",
    "type-unsupported",
  ];
  if (
    !rawStats ||
    statNames.some(
      (name) =>
        rawStats[name] !== undefined &&
        (!Number.isInteger(rawStats[name]) || rawStats[name] < 0),
    )
  ) {
    return {
      provider: "VirusTotal",
      status: "unavailable",
      reason: "invalid_response",
      checkedAt,
    };
  }

  const stats = Object.fromEntries(
    statNames.map((name) => [name, rawStats[name] ?? 0]),
  );
  stats.total = statNames.reduce((total, name) => total + stats[name], 0);
  const timestamp = attributes.last_analysis_date;
  const analysisDate =
    Number.isInteger(timestamp) && Math.abs(timestamp) <= 8_640_000_000_000
      ? new Date(timestamp * 1000).toISOString()
      : null;

  return {
    provider: "VirusTotal",
    status: "found",
    checkedAt,
    lastAnalysisDate: analysisDate,
    stats,
    evidence: mapEvidence(attributes),
  };
}
