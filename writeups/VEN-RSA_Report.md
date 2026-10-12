# Security Assessment Report — VEN RSA Can Be Broken???

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) (challenge author: Michael Crotty) |
| Category | Cryptography |
| Difficulty | Medium |
| Date | 2026-05-02 (confirmed by owner) |
| Environment | Remote challenge service reached over raw TCP (netcat); solver in Python |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

The challenge exposes an RSA service that returns a public modulus `N`, exponent
`e`, and an encrypted flag `C`. Its key generator is broken: every `N` it
produces is even. For a product of two primes an even `N` means one prime is 2,
so `N` factors in a single division, the private key is reconstructed, and the
flag decrypts. This is a cryptographic implementation flaw (bad prime
selection), not a protocol or network weakness. The fix is correct prime
generation.

## 2. Scope and Rules of Engagement

- **In scope:** the single CyLab RSA challenge service.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-05-02. Times not recorded.
- **Constraints:** training challenge; solved offline from service-supplied values.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases that applied: **intelligence gathering** (pull the provided
`encrypt.py` and sample `N` from the service), **vulnerability analysis**
(observe `N` is even across samples), **exploitation** (factor, derive `d`,
decrypt). This is mathematical analysis, not a network attack — no service was
overwhelmed or evaded.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | RSA challenge service over raw TCP |
| Given | `N`, `e` (65537), ciphertext `C`; source `encrypt.py` |
| Tooling | Python, netcat / socket |
| Access from | attacker machine, network client only |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | Key generator yields an even modulus (one prime = 2) | CWE-1240 Use of a Cryptographic Primitive with a Risky Implementation; CWE-327 Use of a Broken or Risky Cryptographic Algorithm | High |

CVE: not applicable (custom lab).
ATT&CK: not assigned — this is an offline cryptographic break; no adversary technique in the matrix maps to it cleanly.
CVSS: not meaningfully applicable — a cryptographic-challenge oracle, not a deployed system (template policy).

## 6. Technical Analysis and Validation

### Finding 1 — Even modulus collapses RSA
- **Observation.** Across several connections the modulus `N` was always even (ended in an even digit). The provided `encrypt.py` multiplies two values from a hidden `get_primes()` with no guarantee they are large or odd.
- **Analysis.** RSA security depends on `N = p × q` being hard to factor. If `N` is even and is a product of two primes, one prime must be 2, so `q = N / 2` and `φ(N) = q − 1`. Weakness: broken prime generation (CWE-1240 / CWE-327). Precondition: ability to request `(N, e, C)` from the service.
- **Validation.** Confirmed `N % 2 == 0` across samples; a GCD across samples found no shared large prime (only the factor 2). Recovered the key and decrypted:
  ```python
  q   = n // 2
  phi = q - 1
  d   = pow(e, -1, phi)
  m   = pow(c, d, n)   # -> flag bytes
  ```
  **Flag captured.**

## 7. Attack Path and Impact

Request `(N, e, C)` → observe `N` even → set `p = 2`, `q = N/2` → derive `d` →
decrypt `C`. Impact: total loss of confidentiality for anything encrypted under
this key generator.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | Even modulus | High | Only network access to the service · full plaintext recovery · breaks every key this generator makes |

No severity grade appears on the existing page; High is assigned here on the
basis above.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Generate primes with a vetted library (e.g. two large, random, odd probable primes); reject any even `N` or small prime | Sample many `N`; all odd, both factors large; factoring is infeasible |

## 10. Limitations

- Steps taken from the existing writeup, not observed by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-05-02, confirmed by owner).
- Severity is the author's assessment.
- Lab finding; reflects an intentionally broken generator.

## 11. Conclusion

A single implementation bug — allowing 2 as a prime — removes all RSA security.
The fix is correct prime generation and validation of `N`.

## References

Checked on 2026-10-12:
- CWE-1240 Use of a Cryptographic Primitive with a Risky Implementation — https://cwe.mitre.org/data/definitions/1240.html
- CWE-327 Use of a Broken or Risky Cryptographic Algorithm — https://cwe.mitre.org/data/definitions/327.html
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
