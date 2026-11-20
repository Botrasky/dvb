import assert from "node:assert/strict";
import test from "node:test";
import { analyzeScripts } from "../../frontend/src/lib/scanner/homograph.ts";
import { parseInput } from "../../frontend/src/lib/scanner/parse.ts";

test("analyzeScripts accurately flags mixed-script Cyrillic/Latin confusable", () => {
  // exаmple.com has Cyrillic 'а' (U+0430) mixed with Latin letters
  const analysis = analyzeScripts("exаmple.com");
  assert.equal(analysis.isMixedScript, true);
  assert.ok(analysis.scripts.includes("Latin"));
  assert.ok(analysis.scripts.includes("Cyrillic"));
  assert.equal(analysis.hasNonAscii, true);
});

test("analyzeScripts does not flag purely Latin domains as mixed-script", () => {
  const analysis = analyzeScripts("example.com");
  assert.equal(analysis.isMixedScript, false);
  assert.deepEqual(analysis.scripts, ["Latin"]);
  assert.equal(analysis.hasNonAscii, false);
});

test("analyzeScripts does not flag legitimate single-script non-Latin domains", () => {
  // Pure Cyrillic domain: яндекс.рф
  const analysis = analyzeScripts("яндекс.рф");
  assert.equal(analysis.isMixedScript, false);
  assert.deepEqual(analysis.scripts, ["Cyrillic"]);
  assert.equal(analysis.hasNonAscii, true);
});

test("parseInput preserves rawHostname before Punycode normalization", () => {
  const parsed = parseInput("https://exаmple.com/login");
  // url.hostname is punycoded
  assert.match(parsed.url.hostname, /^xn--/);
  // rawHostname preserves the original non-ASCII Unicode
  assert.equal(parsed.rawHostname, "exаmple.com");
});
