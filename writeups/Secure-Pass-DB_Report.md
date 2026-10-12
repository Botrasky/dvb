# Security Assessment Report — Secure Password Database

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | Reverse Engineering |
| Difficulty | Medium |
| Date | 2026-07-19 (confirmed by owner) |
| Environment | ELF64 PIE binary (x86-64, not stripped); live service over TCP |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

A C program stores a password in a buffer that also holds a hidden secret. On readback it prints bytes up to a
**user-supplied length**, capped only at the buffer size — so a caller can read
past their own password into the secret (a Heartbleed-class over-read). The
secret feeds a hash check that unlocks the flag. Because the binary is not
stripped, the secret and hash were recovered offline. The root weakness is
trusting a user-supplied length when reading a buffer. The fix is to bound the
readback to the data actually written.

## 2. Scope and Rules of Engagement

- **In scope:** the single Secure Password Database binary and its live instance.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-07-19. Times not recorded.
- **Constraints:** training challenge; analysis mostly offline.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases: **vulnerability analysis** (static RE with objdump/Ghidra to map
the buffer, the secret, and the hash check) and **exploitation** (recompute the
hash offline; submit it to the live service). A live over-read is documented as
a fallback if the build differs.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | ELF64 PIE, x86-64, not stripped |
| Layout | a DB buffer holding the password and, beyond it, a hidden secret (exact sizes and offsets not recorded here) |
| Check | if the submitted value matches a hash of the secret, the flag prints |
| Tooling | objdump / Ghidra, Python, netcat |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | Readback trusts a user-supplied length → buffer over-read leaks the secret | CWE-125 Out-of-bounds Read; CWE-130 Improper Handling of Length Parameter Inconsistency | High |

CVE: not applicable (custom lab).
ATT&CK: not assigned — a local memory over-read in a CTF binary has no clean ATT&CK mapping.
CVSS: 7.5 (High), `AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` — network-reachable; a caller-chosen length over-reads memory (confidentiality-only impact).

## 6. Technical Analysis and Validation

### Finding 1 — Over-read via user-supplied length
- **Observation.** The readback loop prints buffer bytes up to a caller-supplied length, capped only at the buffer size — so the length can be pushed past the password into the hidden secret (exact sizes and offsets not recorded here). The `.rodata` string `heartbleed.c` signals the intended bug.
- **Analysis.** Trusting a caller-supplied length while reading a buffer lets the caller read beyond the written data. Weaknesses: CWE-125 (out-of-bounds read) and CWE-130 (length parameter inconsistency). CWE-130's Observed Examples include CVE-2014-0160 — "Chain: 'Heartbleed' bug receives an inconsistent length parameter" — so CWE-130 fits this Heartbleed-style over-read (the challenge even ships the `.rodata` string `heartbleed.c`). Precondition: interact with the program and choose the length.
- **Validation.** Two paths, both confirmed:
  - **Offline (used):** the unstripped binary exposed the obfuscated secret and the hash routine; recomputed the hash and submitted it. Password and length could be anything; only the hash is checked. **Flag captured.**
  - **Live fallback:** choose a length past the password to dump the secret bytes, recompute the hash, submit.
  ```
  printf 'a\n5\n<hash>\n' | nc <host> <port>   # value redacted
  ```

## 7. Attack Path and Impact

Analyse the binary (or over-read live) → recover the hidden secret → compute
its hash → submit it → flag prints. Impact: disclosure of in-memory data
the program never intended to reveal, and the authentication gate behind it.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | Buffer over-read | High | Only interaction with the program · leaks adjacent secret memory · defeats the hash gate |

No severity grade appears on the existing page; High is assigned here on the
basis above.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Bound the readback to the number of bytes actually written (track real length; ignore caller-supplied length, or validate it against it); keep secrets out of a buffer shared with user data | Request an over-long length — output stops at the written data; no bytes past the password are returned |

## 10. Limitations

- Steps taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-07-19, confirmed by owner).
- Severity is the author's assessment.
- Lab finding; the binary intentionally embeds the `heartbleed.c` hint and the secret.
- Note: the published page previously spelled out the flag value in its Takeaways; this has been redacted on the page as part of this change.

## 11. Conclusion

Trusting a user-supplied length on readback is the whole Heartbleed class. Bound
reads to the data written, and keep secrets out of user-facing buffers.

## References

Checked on 2026-10-12:
- CWE-125 Out-of-bounds Read — https://cwe.mitre.org/data/definitions/125.html
- CWE-130 Improper Handling of Length Parameter Inconsistency — https://cwe.mitre.org/data/definitions/130.html
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
