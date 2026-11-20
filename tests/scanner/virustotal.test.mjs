import assert from "node:assert/strict";
import test from "node:test";
import { handlePhishingCheck } from "../../backend/phishing-check.mjs";
import {
  lookupVirusTotal,
  normalizeLookupUrl,
} from "../../backend/virustotal.mjs";

const instant = () => new Date("2026-11-20T00:00:00.000Z");
const response = (status, body = {}) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => body,
});

test("normalizes a domain and rejects unsupported or credential-bearing URLs", () => {
  assert.equal(normalizeLookupUrl("example.com"), "https://example.com/");
  assert.throws(() => normalizeLookupUrl("ftp://example.com"), /HTTP\(S\)/);
  assert.throws(
    () => normalizeLookupUrl("https://user:pass@example.com"),
    /credentials/,
  );
  assert.throws(
    () => normalizeLookupUrl("https://example.com/#access_token=abc"),
    /fragments/,
  );
  assert.throws(
    () => normalizeLookupUrl("https://example.com/?session=abc"),
    /sensitive/,
  );
});

test("returns not configured without making an external request", async () => {
  let called = false;
  const result = await lookupVirusTotal("example.com", {
    apiKey: "",
    fetchImpl: async () => {
      called = true;
      return response(200);
    },
    now: instant,
  });
  assert.equal(called, false);
  assert.deepEqual(result, {
    provider: "VirusTotal",
    status: "unavailable",
    reason: "not_configured",
    checkedAt: "2026-11-20T00:00:00.000Z",
  });
});

test("maps a provider report into the ZEUS response shape", async () => {
  let requestedUrl = "";
  let sentKey = "";
  const result = await lookupVirusTotal("https://example.com/path", {
    apiKey: "server-only-key",
    fetchImpl: async (url, options) => {
      requestedUrl = url;
      sentKey = options.headers["x-apikey"];
      return response(200, {
        data: {
          attributes: {
            last_analysis_date: 1795132800,
            last_analysis_stats: {
              malicious: 2,
              suspicious: 1,
              harmless: 8,
              undetected: 4,
              timeout: 0,
            },
            reputation: -3,
            total_votes: { malicious: 2, harmless: 4 },
            times_submitted: 7,
            categories: {
              Fortinet: "Phishing",
              suspicious: "https://private.example/",
            },
            targeted_brand: { ExampleBank: {} },
            tags: ["phishing", "https://private.example/"],
            last_analysis_results: {
              EngineA: { category: "malicious", result: "phishing" },
              EngineB: {
                category: "suspicious",
                result: "https://private.example/",
              },
            },
          },
        },
      });
    },
    now: instant,
  });
  assert.match(
    requestedUrl,
    /^https:\/\/www\.virustotal\.com\/api\/v3\/urls\//,
  );
  assert.equal(sentKey, "server-only-key");
  assert.deepEqual(result, {
    provider: "VirusTotal",
    status: "found",
    checkedAt: "2026-11-20T00:00:00.000Z",
    lastAnalysisDate: new Date(1795132800 * 1000).toISOString(),
    stats: {
      malicious: 2,
      suspicious: 1,
      harmless: 8,
      undetected: 4,
      timeout: 0,
      "confirmed-timeout": 0,
      failure: 0,
      "type-unsupported": 0,
      total: 15,
    },
    evidence: {
      communityReputation: -3,
      communityVotes: { harmless: 4, malicious: 2 },
      timesSubmitted: 7,
      categories: [{ source: "Fortinet", category: "Phishing" }],
      targetedBrands: ["ExampleBank"],
      tags: ["phishing"],
      engines: [
        { engine: "EngineA", category: "malicious", result: "phishing" },
        { engine: "EngineB", category: "suspicious", result: null },
      ],
    },
  });
  assert.equal(JSON.stringify(result).includes("example.com"), false);
  assert.equal(JSON.stringify(result).includes("server-only-key"), false);
});

test("distinguishes an unknown URL report and provider throttling", async () => {
  const notFound = await lookupVirusTotal("example.com", {
    apiKey: "key",
    fetchImpl: async () => response(404),
    now: instant,
  });
  const throttled = await lookupVirusTotal("example.com", {
    apiKey: "key",
    fetchImpl: async () => response(429),
    now: instant,
  });
  assert.equal(notFound.status, "not_found");
  assert.equal(throttled.reason, "rate_limited");
});

test("does not follow provider redirects or expose provider errors", async () => {
  let options;
  const result = await lookupVirusTotal("example.com", {
    apiKey: "server-only-key",
    fetchImpl: async (_url, requestOptions) => {
      options = requestOptions;
      return response(503, { error: { message: "private provider detail" } });
    },
    now: instant,
  });
  assert.equal(options.redirect, "error");
  assert.equal(options.method, "GET");
  assert.deepEqual(result, {
    provider: "VirusTotal",
    status: "unavailable",
    reason: "provider_error",
    checkedAt: "2026-11-20T00:00:00.000Z",
  });
  assert.equal(
    JSON.stringify(result).includes("private provider detail"),
    false,
  );
});

function checkRequest(body, headers = {}, method = "POST") {
  return new Request("https://zeuswriteups.vercel.app/api/phishing-check", {
    method,
    headers: { "content-type": "application/json", ...headers },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });
}

test("requires same-origin JSON and explicit consent before provider lookup", async () => {
  let called = false;
  const lookup = async () => {
    called = true;
    return { status: "not_found" };
  };
  const noConsent = await handlePhishingCheck(
    checkRequest({ url: "https://example.com", consent: false }),
    { lookup },
  );
  const crossOrigin = await handlePhishingCheck(
    checkRequest(
      { url: "https://example.com", consent: true },
      { origin: "https://attacker.example" },
    ),
    { lookup },
  );
  const wrongType = await handlePhishingCheck(
    new Request("https://zeuswriteups.vercel.app/api/phishing-check", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "{}",
    }),
    { lookup },
  );
  assert.equal(noConsent.status, 400);
  assert.equal(crossOrigin.status, 403);
  assert.equal(wrongType.status, 415);
  assert.equal(called, false);
});

test("rejects oversized requests and unsupported methods", async () => {
  const oversized = await handlePhishingCheck(
    new Request("https://zeuswriteups.vercel.app/api/phishing-check", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "20000",
      },
      body: "{}",
    }),
  );
  const wrongMethod = await handlePhishingCheck(checkRequest({}, {}, "GET"));
  assert.equal(oversized.status, 413);
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get("allow"), "POST");
  assert.equal(oversized.headers.get("cache-control"), "no-store");
});

test("validates server-side URL input and never returns submitted URLs", async () => {
  let called = false;
  const invalid = await handlePhishingCheck(
    checkRequest({ url: "file:///etc/passwd", consent: true }),
    {
      lookup: async () => {
        called = true;
        return {};
      },
    },
  );
  const valid = await handlePhishingCheck(
    checkRequest({ url: "https://example.com/private", consent: true }),
    {
      lookup: async () => ({ provider: "VirusTotal", status: "not_found" }),
    },
  );
  assert.equal(invalid.status, 400);
  assert.equal(called, false);
  assert.equal(valid.status, 200);
  assert.equal(
    await valid.text(),
    JSON.stringify({
      provider: "VirusTotal",
      status: "not_found",
      verdict: {
        level: "inconclusive",
        reason: "no_virustotal_report",
      },
    }),
  );
});

test("uses VirusTotal alone for a clean report and handles provider failures", async () => {
  let calls = 0;
  const clean = await handlePhishingCheck(
    checkRequest({ url: "https://example.com", consent: true }),
    {
      lookup: async () => {
        calls++;
        return {
          provider: "VirusTotal",
          status: "found",
          stats: { malicious: 0, suspicious: 0, total: 93 },
        };
      },
    },
  );
  const cleanBody = await clean.json();
  assert.equal(calls, 1);
  assert.equal(cleanBody.verdict.level, "no_known_threat_found");
  assert.equal(Object.hasOwn(cleanBody, "google"), false);

  const failed = await handlePhishingCheck(
    checkRequest({ url: "https://example.com", consent: true }),
    {
      lookup: async () => {
        throw new Error("private provider detail");
      },
    },
  );
  const failedBody = await failed.json();
  assert.equal(failed.status, 200);
  assert.equal(failedBody.status, "unavailable");
  assert.equal(failedBody.verdict.level, "inconclusive");
  assert.equal(
    JSON.stringify(failedBody).includes("private provider detail"),
    false,
  );
});
