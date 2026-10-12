# Security Assessment Report — Hidden Cipher 2

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | Reverse Engineering |
| Difficulty | Medium |
| Date | 2026-07-21 (confirmed by owner) |
| Environment | ELF64 PIE binary (not stripped); live service over TCP |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

The binary asks a math question and, on a correct answer, prints the flag
"encoded" by multiplying each flag byte by the user's answer. Multiplication by
a known value is trivially reversible, so dividing each encoded value by the
answer recovers the flag. The weakness is treating a reversible transform as if
it were encryption. There is no real secret: the inverse is exact.

## 2. Scope and Rules of Engagement

- **In scope:** the single Hidden Cipher 2 binary and its live instance.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-07-21. Times not recorded.
- **Constraints:** training challenge.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases: **intelligence gathering** (`file`, `strings`) and **vulnerability
analysis** (read `encode_flag` in objdump; the binary is not stripped), then
**exploitation** (a solver that answers the prompt and divides the encoded
values back).

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | ELF64 PIE, not stripped |
| Transform | `encoded = flag_byte × answer`, comma-separated output |
| Tooling | file, strings, objdump, Python |
| Access from | network client to the service |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | Reversible transform used as "encryption" (multiply by a known value) | CWE-327 Use of a Broken or Risky Cryptographic Algorithm | Medium |

CVE: not applicable (custom lab).
ATT&CK: not assigned — reversing a CTF transform has no clean ATT&CK mapping.
CVSS: not meaningfully applicable — a cryptographic-challenge oracle, not a deployed system (template policy).

## 6. Technical Analysis and Validation

### Finding 1 — Reversible "cipher"
- **Observation.** `strings` named the behaviour ("Encoded flag values:", the prompt format); `encode_flag` multiplies each flag byte by the user-supplied answer and prints the products.
- **Analysis.** Multiplying by a known multiplier is not encryption — `flag_byte = encoded ÷ answer` is an exact inverse. Weakness: CWE-327 (a broken/risky "algorithm"). Precondition: knowing the answer, which the solver computes from the prompt.
- **Validation.** The solver parses the question, computes the answer, sends it, reads the encoded list, and divides each value by the answer:
  ```python
  answer = a+b if op=='+' else abs(a-b) if op=='-' else a*b
  flag = bytes(v // answer for v in encoded).decode()
  ```
  **Flag captured.**

## 7. Attack Path and Impact

Read the prompt → compute the answer → receive the encoded flag → divide back →
plaintext flag. Impact: full recovery of the "protected" value; the scheme
offers no confidentiality.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | Reversible transform | Medium | Only the known multiplier · full recovery of the encoded value · the transform provides no protection, but the impact is limited to this challenge's "secret" |

No severity grade appears on the existing page; Medium is assigned here on the
basis above.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Do not present reversible encodings as encryption; use a vetted algorithm with a real key if confidentiality is required | Given the output and public parameters, recovering the plaintext is infeasible without the key |

## 10. Limitations

- Steps taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-07-21, confirmed by owner).
- Severity is the author's assessment.
- Lab finding; the transform is intentionally reversible.

## 11. Conclusion

A reversible transform is not encryption. Where confidentiality matters, use a
real algorithm and key.

## References

Checked on 2026-10-12:
- CWE-327 Use of a Broken or Risky Cryptographic Algorithm — https://cwe.mitre.org/data/definitions/327.html
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
