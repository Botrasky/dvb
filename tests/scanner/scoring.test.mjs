import assert from "node:assert/strict";
import test from "node:test";
import {
  CAPS,
  SCORING_VERSION,
  scanUrl,
} from "../../frontend/src/lib/scanner/engine.ts";

test("partial coverage keeps the score unavailable", () => {
  const result = scanUrl("https://example.com/login");
  assert.equal(result.score, null);
  assert.equal(result.isPartial, true);
  assert.equal(result.scoringVersion, SCORING_VERSION);
});

test("finding contributions never exceed their category caps", () => {
  const result = scanUrl(
    "http://alice:secret@127.0.0.1:9090/account/verify/urgent?url=https://attacker.test&token=x",
  );
  for (const [category, cap] of Object.entries(CAPS)) {
    const total = result.findings
      .filter((finding) => finding.category === category)
      .reduce((sum, finding) => sum + finding.scoreContribution, 0);
    assert.ok(total <= cap);
  }
});
