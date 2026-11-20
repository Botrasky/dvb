import assert from "node:assert/strict";
import test from "node:test";
import { reputationVerdict } from "../../backend/reputation-verdict.mjs";

test("VirusTotal evidence yields conservative first-stage verdicts", () => {
  const vt = (malicious, suspicious, total = 80) => ({
    status: "found",
    stats: { malicious, suspicious, total },
  });
  assert.equal(reputationVerdict(vt(3, 0)).level, "known_threat");
  assert.equal(reputationVerdict(vt(1, 0)).level, "suspicious");
  assert.deepEqual(reputationVerdict(vt(0, 0)), {
    level: "no_known_threat_found",
    reason: "no_virustotal_detection",
  });
  assert.equal(
    reputationVerdict({ status: "not_found" }).level,
    "inconclusive",
  );
  assert.equal(
    reputationVerdict({ status: "unavailable" }).level,
    "inconclusive",
  );
});
