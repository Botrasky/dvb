/** ZEUS V1: browser-only URL analysis contracts. No network operations. */
export type Category = 'brand-impersonation' | 'suspicious-characters' | 'ip-and-port' | 'shortener' | 'https-and-credentials' | 'phishing-keywords';
export type CoverageStatus = 'completed' | 'skipped' | 'unavailable' | 'failed';
export interface Finding {
  ruleId: string;
  category: Category;
  severity: 'info' | 'low' | 'medium' | 'high';
  scoreContribution: number;
  redactedEvidence: string;
  explanation: string;
  recommendation: string;
}
export interface ScanResult {
  inputKind: 'complete-url' | 'domain-only';
  redactedDisplayUrl: string;
  registrableDomain: string | null;
  scannedAt: string;
  score: number | null;
  label: string;
  coverage: Array<{ id: Category; status: CoverageStatus }>;
  findings: Finding[];
  engineVersion: string;
  scoringVersion: string;
  rulesVersion: string;
  rulesUpdatedAt: string | null;
  isPartial: boolean;
  limitations: string[];
}
export interface ParsedInput {
  inputKind: ScanResult['inputKind'];
  url: URL;
  originalInput: string;
  assumedScheme: boolean;
}
