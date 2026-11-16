import assert from "node:assert/strict";
import test from "node:test";
import { pslDomainParser } from "../../frontend/src/lib/scanner/domainParser.ts";
import { scanUrl } from "../../frontend/src/lib/scanner/engine.ts";

test("scanUrl uses the Public Suffix List by default and withholds a partial score", () => {
  const result = scanUrl("https://sub.example.co.uk/");
  assert.equal(result.registrableDomain, "example.co.uk");
  assert.equal(
    result.coverage.find(({ id }) => id === "suspicious-characters")?.status,
    "unavailable",
  );
  assert.equal(result.score, null);
});

test("pslDomainParser correctly identifies standard ASCII domains", () => {
  const result = pslDomainParser("sub.example.com");
  assert.equal(result.domain, "example.com");
  assert.equal(result.publicSuffix, "com");
  assert.equal(result.subdomain, "sub");
  assert.equal(result.isIp, false);
});

test("pslDomainParser retains Punycode for IDN domains empirically", () => {
  const result = pslDomainParser("xn--b1aef.xn--p1ai");
  assert.equal(result.domain, "xn--b1aef.xn--p1ai");
  assert.equal(result.publicSuffix, "рф");
  assert.equal(result.subdomain, null);
  assert.equal(result.isIp, false);
});

test("pslDomainParser handles hyphenated and deceptive domain structures correctly", () => {
  const result = pslDomainParser("paypal.com-phishing.com");
  assert.equal(result.domain, "com-phishing.com");
  assert.equal(result.publicSuffix, "com");
  assert.equal(result.subdomain, "paypal");
  assert.equal(result.isIp, false);
});

test("pslDomainParser recognizes IPv4 addresses and marks isIp without domain", () => {
  const result = pslDomainParser("192.168.1.1");
  assert.equal(result.isIp, true);
  assert.equal(result.domain, null);
  assert.equal(result.publicSuffix, null);
});

test("pslDomainParser rejects IPv4 octets outside the valid range", () => {
  assert.equal(pslDomainParser("999.999.999.999").isIp, false);
  assert.equal(pslDomainParser("255.255.255.255").isIp, true);
});

test("pslDomainParser recognizes IPv6 addresses and marks isIp without domain", () => {
  const bracketed = pslDomainParser("[::1]");
  assert.equal(bracketed.isIp, true);
  assert.equal(bracketed.domain, null);

  const raw = pslDomainParser("fe80::1");
  assert.equal(raw.isIp, true);
  assert.equal(raw.domain, null);
});

test("pslDomainParser returns null domain for localhost or unlisted TLDs", () => {
  const localhost = pslDomainParser("localhost");
  assert.equal(localhost.domain, null);
  assert.equal(localhost.isIp, false);

  const unlisted = pslDomainParser("internal.corp");
  assert.equal(unlisted.domain, null);
  assert.equal(unlisted.isIp, false);
});
