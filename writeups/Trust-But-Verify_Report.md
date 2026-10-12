# Activity Report — Trust But Verify

> **Note on framing.** Trust But Verify is an interactive-fiction *game*, not a
> vulnerable target. There is no security weakness to exploit: the flag prints
> at the end of the story regardless of the choices made. This report therefore
> follows the standard template but marks the security-specific sections *not
> applicable*, and documents the automation work instead.

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise (interactive-fiction challenge) |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | Misc / Interactive Fiction |
| Difficulty | Easy |
| Date | 2026-10-10 (confirmed by owner) |
| Environment | Raw-TCP interactive story service; Python socket auto-player |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

The challenge is a story game that pauses frequently and prints the flag near
the end. The task was not to find a vulnerability but to automate a slow,
mixed-prompt CLI reliably enough to reach the ending. A prompt-aware auto-player
pressed through the pauses, answered the choices, and captured the flag. A
observation worth recording: the branching choices do not gate the flag — the
ending is reached regardless of what is chosen.

## 2. Scope and Rules of Engagement

- **In scope:** the single Trust But Verify challenge service.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-10-10. Times not recorded.
- **Constraints:** training challenge; interaction only with the game service.

This is a training challenge, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

Not a penetration test. The work was automation: read the stream, detect which
of two prompt types is waiting (a pause vs. a lettered choice), and respond
appropriately. Technique only — no security phases apply.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | Raw-TCP interactive story; two prompt types: "Press Enter" (blank line) and choice `[a/b/c] >` |
| Tooling | Python sockets, netcat |
| Access from | network client |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | Branching choices do not gate the flag (design observation, not a vulnerability) | Not assigned — design behaviour of a game, not a security weakness | Informational |

CVE: not applicable (not a software vulnerability).
ATT&CK: not applicable (not an adversary technique).
CWE: not assigned (no security weakness identified).
CVSS: not applicable (not a vulnerability).

## 6. Technical Analysis and Validation

### Finding 1 — Choices do not gate the flag
- **Observation.** In one run the auto-player picked a non-"verify" option (a stray keyword in the scorer), yet the flag still printed.
- **Analysis.** The ending — and the flag — is reached regardless of the choices; the branches only reframe the narrative. This is a property of the game's design, not a security flaw.
- **Validation.** The transcript shows the flag printing after a mixed set of choices (`b, a, b`), including the "wrong" one. The auto-player waited for the stream to go quiet (~1.2s) before responding, and wrote the transcript to disk live so a timeout could not lose the flag. **Flag captured.**

## 7. Attack Path and Impact

Not applicable — no attack. The path to the flag is simply playing the game to
its end, automated for reliability.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

Not applicable — there is no security risk in a single-player story game. The
one finding is **Informational**: a design observation that choices do not
affect the outcome.

## 9. Remediation and Retesting

Not applicable. (If the author intended choices to gate the ending, the fix
would be to branch the flag-printing on the chosen path — but this is a design
decision, not a security remediation.)

## 10. Limitations

- Steps taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-10-10, confirmed by owner).
- "Choices don't gate the flag" is based on a single run (quick notes), not exhaustively verified.
- This is a game; no security findings are claimed.

## 11. Conclusion

A straightforward automation exercise against a story game. The notable takeaway
is engineering discipline — detect the prompt, wait on the signal, log live —
rather than any vulnerability.

## References

Methodology references (cited for consistency across reports; this challenge was not a penetration test):
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

- CVE / CWE / ATT&CK: not applicable / not assigned (see sections 5–6).
