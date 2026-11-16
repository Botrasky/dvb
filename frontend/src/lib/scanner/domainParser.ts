import { parse } from "psl";
import type { DomainInfo, DomainParser } from "./types.ts";

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

export const pslDomainParser: DomainParser = (host: string): DomainInfo => {
  const normalized = host.toLowerCase().trim();

  // IPv6 bracketed or raw hex check
  if (normalized.startsWith("[") || normalized.includes(":")) {
    return {
      domain: null,
      publicSuffix: null,
      subdomain: null,
      isIp: true,
    };
  }

  // IPv4 check
  if (
    IPV4_PATTERN.test(normalized) &&
    normalized.split(".").every((octet) => Number(octet) <= 255)
  ) {
    return {
      domain: null,
      publicSuffix: null,
      subdomain: null,
      isIp: true,
    };
  }

  const parsed = parse(normalized);
  if ("error" in parsed || !parsed.listed) {
    return {
      domain: null,
      publicSuffix: null,
      subdomain: null,
      isIp: false,
    };
  }

  return {
    domain: parsed.domain ?? null,
    publicSuffix: parsed.tld ?? null,
    subdomain: parsed.subdomain ?? null,
    isIp: false,
  };
};
