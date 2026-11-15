# Security Assessment Report — <Target Name>

<!--
Reusable report skeleton for writeups in this repo.
Copy to writeups/<Name>_Report.md and fill every section.
Two rules override everything else here:
  1. Never publish a flag value. Write "flag captured" or "<redacted>".
  2. Never state a CWE / CVE / ATT&CK ID you have not opened on the official
     site yourself. If you cannot verify it, write "not assigned".
Method detail that was not recorded at the time should be written
"not recorded" rather than reconstructed.
-->

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | <OffSec Proving Grounds / CyLab Security Academy (formerly picoCTF) / ...> |
| Category | <Pentesting / crypto / pwn / web / re / general / misc> |
| Difficulty | <Easy / Medium / Hard> |
| Date | <YYYY-MM-DD, owner-supplied, else "not recorded"> |
| Environment | <OS, how reached, from what> |
| Status | <Completed / Partial> |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

Two or three short paragraphs for a reader who will not read the rest: what the
target was, what was found, how serious it is, what to fix first. No commands.

## 2. Scope and Rules of Engagement

- In scope: <hosts / IPs / URLs>
- Out of scope: <anything excluded>
- Authorization: <who authorized it; for a lab, the platform's terms>
- Window: <dates/times, or "not recorded">
- Constraints: <no DoS, no destructive actions, single-user lab>

State that this is a deliberately vulnerable training target, not production.

## 3. Methodology

Phases actually followed, in order (PTES phase names). Where the record is a set
of quick notes rather than a formal log, say so ("based on the author's quick
notes"). Do not reconstruct detail that was not recorded.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target OS | <as observed, or "not recorded"> |
| Services / versions | <as observed> |
| Tooling | <tools used> |
| Access from | <attacker vantage point> |

## 5. Findings

One row per finding. Severity uses the single grid in section 8. Each finding
also carries, where verified, a CWE, an ATT&CK technique, and a CVSS line (see
section 8 for when CVSS is used).

| # | Finding | Weakness type (CWE) | ATT&CK | Severity |
|---|---|---|---|---|
| 1 | <short title> | <CWE id + name, or "not assigned"> | <Txxxx, or "not assigned"> | <grade> |

CVE: not applicable for custom labs.

## 6. Technical Analysis and Validation

Per finding, three subsections:

### Finding N — <title>
- **Observation** — what was seen. Facts only.
- **Analysis** — what it means, weakness type, preconditions.
- **Validation** — how it was proven (command, output, result). Flag redacted.
  Detail that was not recorded is marked "not recorded", not reconstructed.

## 7. Attack Path and Impact

The chain from entry to objective, step to step. What an attacker gains at each
hop, and the final impact.

## 8. Risk Assessment — the single severity rule

**Every report in this repo uses this one grid.** Rate each finding on three
things: **prerequisites**, **what the attacker gains**, and **whether it applies
beyond the lab**.

| Severity | Meaning |
|---|---|
| Critical | Direct path to full control (root/admin) of the target |
| High | Little/no prerequisite, or major access gain short of full control |
| Medium | Needs a foothold or specific condition; meaningful gain |
| Low | Limited gain, or strong preconditions |
| Informational | No security impact; a design or hygiene observation |

**CVSS.** The qualitative grid above is the primary rating. In addition, where a
finding maps to a *deployable software weakness*, that report gives a **CVSS 3.1
base vector and score** inline as a supplementary reference. Findings that are
cryptographic-challenge oracles, game-design observations, or chained
information-leaks are **not** assigned a CVSS base score — CVSS assumes a
deployed system and would misrepresent a single-purpose lab target — and are
marked "CVSS: not meaningfully applicable" with a one-line reason. CVSS base
scores can be counterintuitive for lab chains (an unauthenticated foothold often
outscores a local privilege escalation), which is why the qualitative grid, not
the CVSS number, is primary.

## 9. Remediation and Retesting

Per finding: a specific fix, and how to confirm the fix worked.

## 10. Limitations

What was not tested, what is observed vs inferred, and the nature of the record.
For these labs: "Based on quick notes taken during the lab, not a formal
engagement log." Note that a lab is an intentionally vulnerable target, so
findings may not generalize.

## 11. Conclusion

Short closing: overall posture of the target and the single most important fix.

## References

Every report cites the same methodology references:

- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

Plus, per report, the CWE and ATT&CK pages cited (id + name + date checked):

- CWE — https://cwe.mitre.org/
- MITRE ATT&CK — https://attack.mitre.org/
