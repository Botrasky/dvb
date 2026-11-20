import { lookupVirusTotal, normalizeLookupUrl } from "./virustotal.mjs";
import { reputationVerdict } from "./reputation-verdict.mjs";

const MAX_BODY_LENGTH = 16_384;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      allow: "POST",
    },
  });
}

export async function handlePhishingCheck(
  request,
  { lookup = lookupVirusTotal } = {},
) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (origin !== new URL(request.url).origin) {
        return json({ error: "Cross-origin requests are not allowed." }, 403);
      }
    } catch {
      return json({ error: "Invalid request origin." }, 403);
    }
  }

  const contentType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json") {
    return json({ error: "Send a JSON request." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_LENGTH) {
    return json({ error: "Request body is too large." }, 413);
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_LENGTH) {
      return json({ error: "Request body is too large." }, 413);
    }
    body = JSON.parse(text);
  } catch {
    return json({ error: "Send a valid JSON request." }, 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    typeof body.url !== "string" ||
    body.consent !== true
  ) {
    return json(
      { error: "A URL and explicit VirusTotal sharing consent are required." },
      400,
    );
  }

  try {
    const validatedUrl = normalizeLookupUrl(body.url);
    const checkedAt = new Date().toISOString();
    let virusTotal;
    try {
      virusTotal = await lookup(validatedUrl);
    } catch {
      virusTotal = {
        provider: "VirusTotal",
        status: "unavailable",
        reason: "provider_error",
        checkedAt,
      };
    }
    return json({
      ...virusTotal,
      verdict: reputationVerdict(virusTotal),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid URL.";
    return json({ error: message }, 400);
  }
}
