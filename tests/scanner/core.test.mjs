import assert from "node:assert/strict";
import test from "node:test";
import { parseInput } from "../../frontend/src/lib/scanner/parse.ts";
import { redactUrl } from "../../frontend/src/lib/scanner/redact.ts";
import { scanUrl, CAPS } from "../../frontend/src/lib/scanner/engine.ts";
import {
  DEMO_RULES,
  validateRules,
} from "../../frontend/src/lib/scanner/rules.ts";
const domain = (host) => {
  if (/^(?:\d+\.){3}\d+$/.test(host) || host.startsWith("["))
    return { domain: null, publicSuffix: null, subdomain: null, isIp: true };
  const pieces = host.split(".");
  if (pieces.length < 2)
    return { domain: null, publicSuffix: null, subdomain: null, isIp: false };
  return {
    domain: pieces.slice(-2).join("."),
    publicSuffix: pieces.at(-1),
    subdomain: pieces.slice(0, -2).join("."),
    isIp: false,
  };
}; // FAKE parser for isolated unit tests only, NOT production PSL.

test("domain-only is not reported as verified HTTPS", () => {
  const p = parseInput("example.com/login");
  assert.equal(p.assumedScheme, true);
  assert.match(redactUrl(p), /scheme not supplied/);
});
test("reject unsupported protocols, controls and oversized URLs", () => {
  for (const s of [
    "javascript:alert(1)",
    "data:text/html,hey",
    "file:///tmp/x",
    "https://example.com\nfoo",
    "a".repeat(8193),
  ])
    assert.throws(() => parseInput(s));
});
test("URL redaction prevents credentials, query values and fragments from appearing", () => {
  const p = parseInput(
    "https://alice:secret@example.com/login?token=PRIVATE&email=bob%40ex.com#AUTHCODE",
  );
  const red = redactUrl(p);
  for (const s of ["alice", "secret", "PRIVATE", "bob", "AUTHCODE"])
    assert.equal(red.includes(s), false);
});
test("known shortener is identified without navigation", () => {
  const r = scanUrl("https://bit.ly/abc", domain, DEMO_RULES);
  assert.ok(r.findings.some((f) => f.ruleId === "url-shortener"));
});
test("userinfo is reported with redacted evidence", () => {
  const r = scanUrl(
    "https://alice:secret@fake.example.com/",
    domain,
    DEMO_RULES,
  );
  assert.ok(r.findings.some((f) => f.ruleId === "url-userinfo"));
  assert.equal(JSON.stringify(r).includes("secret"), false);
});
test("brand label in deceptive subdomain is identified", () => {
  const r = scanUrl("https://example.com.attacker.test/", domain, DEMO_RULES);
  assert.ok(r.findings.some((f) => f.ruleId === "brand-subdomain-example"));
});
test("legitimate brand is not punished for its own domain", () => {
  const r = scanUrl("https://example.com/login", domain, DEMO_RULES);
  assert.equal(
    r.findings.some((f) => f.category === "brand-impersonation"),
    false,
  );
});
test("incomplete coverage withholds a numeric score and safety verdict", () => {
  const r = scanUrl("https://example.com/", domain, DEMO_RULES);
  assert.equal(r.score, null);
  assert.equal(r.isPartial, true);
  assert.ok(!/^safe/i.test(r.label));
});
test("category contribution is capped", () => {
  const r = scanUrl(
    "http://alice:secret@127.0.0.1:9090/account/verify/urgent?url=https://attacker.test&token=x",
    domain,
    DEMO_RULES,
  );
  for (const [cat, cap] of Object.entries(CAPS))
    assert.ok(
      r.findings
        .filter((f) => f.category === cat)
        .reduce((s, f) => s + f.scoreContribution, 0) <= cap,
    );
});
test("unparseable suffix yields a partial analysis, not a definitive score", () => {
  const r = scanUrl("http://localhost/", domain, DEMO_RULES);
  assert.equal(r.isPartial, true);
  assert.equal(r.score, null);
});
test("rules reject unknown keys, scripts and invalid values", () => {
  for (const r of [
    { ...DEMO_RULES, exec: "alert(1)" },
    { ...DEMO_RULES, shorteners: ["<script>"] },
    { ...DEMO_RULES, schemaVersion: 99 },
  ])
    assert.throws(() => validateRules(r));
});
