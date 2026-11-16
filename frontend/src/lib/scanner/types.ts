export type Category =
  | "brand-impersonation"
  | "suspicious-characters"
  | "ip-and-port"
  | "shortener"
  | "https-and-credentials"
  | "phishing-keywords";
export type CoverageStatus = "completed" | "skipped" | "unavailable" | "failed";
export interface Finding {
  ruleId: string;
  category: Category;
  severity: "info" | "low" | "medium" | "high";
  scoreContribution: number;
  categoryCap: number;
  redactedEvidence: string;
  explanation: string;
  recommendation: string;
}
export interface ScanResult {
  inputKind: "complete-url" | "domain-only";
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
  inputKind: ScanResult["inputKind"];
  url: URL;
  assumedScheme: boolean;
}
export interface DomainInfo {
  domain: string | null;
  publicSuffix: string | null;
  subdomain: string | null;
  isIp: boolean;
}
export type DomainParser = (host: string) => DomainInfo;
export interface BrandRule {
  id: string;
  name: string;
  domains: readonly string[];
}
export interface ScannerRules {
  schemaVersion: 1;
  version: string;
  updatedAt: string;
  shorteners: readonly string[];
  brands: readonly BrandRule[];
  keywords: readonly string[];
}
