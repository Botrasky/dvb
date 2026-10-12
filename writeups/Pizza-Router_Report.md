# Security Assessment Report — Pizza Router

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | Binary Exploitation |
| Difficulty | Hard |
| Date | 2026-05-03 (confirmed by owner) |
| Environment | ELF binary (PIE, ASLR); tested locally then against the live instance |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

A drone-routing binary exposes a `reroute` command whose index is not
bounds-checked, giving an arbitrary 32-bit write relative to a heap route list.
Two staged writes overwrite an order's "finish" callback pointer with the
address of a built-in flag-printing function; dispatching that order then calls
it and prints the flag. The root weakness is missing array-index
validation leading to an out-of-bounds write. The fix is bounds-checking the
index.

## 2. Scope and Rules of Engagement

- **In scope:** the single Pizza Router challenge binary and its live instance.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-05-03. Times not recorded.
- **Constraints:** training challenge; exploit built against the provided binary.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases: **vulnerability analysis** (static review with objdump, then live
GDB to recover the real offsets) and **exploitation** (the two-stage write and
trigger). Offsets were derived from runtime leaks rather than hardcoded, so the
exploit is ASLR-independent.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | ELF, position-independent (PIE), ASLR on |
| Tooling | objdump, GDB, Python (pwntools-style) |
| Key structures | a heap route list, per-order heap contexts, and a per-order "finish" callback pointer (exact offsets, indices, and internal symbol names not recorded here) |
| Access from | interactive client to the program's command loop |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | `reroute` index is not bounds-checked → arbitrary heap-relative write | CWE-129 Improper Validation of Array Index; CWE-787 Out-of-bounds Write | Critical |

CVE: not applicable (custom lab).
ATT&CK: not assigned — memory-corruption primitives in a CTF binary do not map cleanly to an ATT&CK technique.
CVSS: 8.1 (High), `AV:N/AC:H/PR:N/UI:N/S:U/C:H/I:H/A:H` — network-reachable service; exploitation requires runtime leaks (`AC:H`) and yields attacker-controlled control flow.

## 6. Technical Analysis and Validation

### Finding 1 — Unbounded index gives an arbitrary write
- **Observation.** `reroute <id> <heap_idx> <new_cost>` writes two dwords at `R + heap_idx*8` with no check on the signed index. `new_cost` is a fully attacker-controlled 32-bit value. The order's finish callback is invoked by the `dispatch` command.
- **Analysis.** An unchecked index into a heap array yields an out-of-bounds write anywhere relative to `R`. Weaknesses: CWE-129 (the missing validation) and CWE-787 (the resulting write). Precondition: ability to issue `reroute` and `dispatch` to the running program.
- **Validation.** Two writes placed the flag-printing function's address into the finish-callback slot (a low-half write then a high-half write), then `dispatch` invoked it:
  ```
  dispatch <order>  -> finish callback now points at the flag-printing routine  -> flag printed
  (exact runtime values not recorded)
  ```
  Verified locally, then against the live instance. **Flag captured.**

## 7. Attack Path and Impact

Reach the command loop → use the unchecked `reroute` index to write
attacker-controlled values at a chosen offset → overwrite the finish callback
with the flag-printing function → `dispatch` the order → that code path executes.
Impact: redirection of control flow within the process, here to read the flag.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | Unbounded index / OOB write | Critical | Only interaction with the program · attacker-chosen control-flow redirection · a classic memory-safety break |

No severity grade appears on the existing page; Critical is assigned here
because an arbitrary write that redirects control flow is a full
memory-safety compromise.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Validate `heap_idx` against the real bounds of the route list (reject negative and out-of-range); build with modern mitigations | Fuzz `reroute` with out-of-range indices — rejected; no write outside the array; the flag-printing function unreachable via data |

## 10. Limitations

- Steps and offsets taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-05-03, confirmed by owner).
- Severity is the author's assessment.
- Lab finding; the binary is intentionally vulnerable and includes a built-in flag-printing function.

## 11. Conclusion

A single missing bounds check on an array index gives an arbitrary write and
full control over the program's flow. Validate the index; the rest follows.

## References

Checked on 2026-10-12:
- CWE-129 Improper Validation of Array Index — https://cwe.mitre.org/data/definitions/129.html
- CWE-787 Out-of-bounds Write — https://cwe.mitre.org/data/definitions/787.html
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
