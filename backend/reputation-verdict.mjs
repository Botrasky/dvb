/** An existing VirusTotal report is a first-stage cross-check, not proof of safety. */
export function reputationVerdict(virusTotal) {
  const stats = virusTotal.status === "found" ? virusTotal.stats : null;
  if (stats?.malicious >= 3) {
    return { level: "known_threat", reason: "virustotal_consensus" };
  }
  if (stats && (stats.malicious > 0 || stats.suspicious > 0)) {
    return { level: "suspicious", reason: "virustotal_detections" };
  }
  if (stats?.total > 0 && stats.malicious === 0 && stats.suspicious === 0) {
    return {
      level: "no_known_threat_found",
      reason: "no_virustotal_detection",
    };
  }
  return { level: "inconclusive", reason: "no_virustotal_report" };
}
