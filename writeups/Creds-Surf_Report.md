# Security Assessment Report — Credential Stuffing

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | Web Exploitation |
| Difficulty | Medium |
| Date | 2026-07-20 (confirmed by owner) |
| Environment | Raw-TCP "Online Banking Service" login; Python socket client |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

The challenge provides 1500 leaked `username;password` pairs and one raw-TCP
login. The service accepts unlimited guesses (one attempt per connection, no
lockout), so replaying the list recovers a working pair that prints the flag.
The root weakness is the absence of any limit on authentication attempts. The
fix is rate limiting / lockout and detection of credential-stuffing patterns.
The challenge's own lesson is that this only works because credentials are
reused across sites.

## 2. Scope and Rules of Engagement

- **In scope:** the single Credential Stuffing login service.
- **Out of scope:** anything else; the leaked list is challenge-provided.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-07-20. Times not recorded.
- **Constraints:** training challenge; credentials supplied by the challenge, not harvested.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases: **intelligence gathering** (probe the raw-TCP protocol and its
failure message) and **exploitation** (scripted replay of the pair list). Most
of the work was engineering a reliable success test, not the attack itself.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | Raw-TCP login; prompts `Username:` / `Password:`; failure ends with `Invalid username or password` then closes |
| Input | 1500 semicolon-separated leaked pairs (challenge-provided) |
| Tooling | Python sockets, netcat |
| Access from | network client |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | No limit on authentication attempts (unlimited guesses, no lockout) | CWE-307 Improper Restriction of Excessive Authentication Attempts; CWE-799 Improper Control of Interaction Frequency | High |

CVE: not applicable (custom lab).
ATT&CK: T1110.004 Brute Force: Credential Stuffing.
CVSS: not assigned a single base score — success depends on a reused credential being present in the breach list (outside the attacker's guaranteed control), so a single base vector would misstate it. Rated by the qualitative grid; the weakness is the missing attempt limit (template policy).

## 6. Technical Analysis and Validation

### Finding 1 — Unlimited authentication attempts
- **Observation.** The service allows one attempt per connection with no lockout; a concurrency cap (~300 parallel) was observed but no per-attempt rate limit. Replaying the leaked list eventually authenticated.
- **Analysis.** With no cap on attempts, an attacker can replay a breach list until a reused credential works. Weaknesses: CWE-307 (no attempt restriction) and CWE-799 (no interaction-frequency control). Precondition: a list of candidate credentials (here, provided).
- **Validation.** A sequential stuffer that reads until the server closes the socket (to avoid truncated replies) and tests for a positive success marker recovered a working pair; the logged-in account printed the flag:
  ```python
  for u, p in pairs:                       # one connection at a time
      txt = one_try(u, p)
      if "Invalid username or password" not in txt and "Password:" in txt:
          print("HIT", u, p); break        # real, complete success reply
  ```
  ```
  Welcome <user>!
  <flag redacted>
  ```
  **Flag captured.**

Engineering notes that were part of the work: a naive "no 'Invalid' = success"
test produced a false positive under a `recv` timeout; reading until close and
requiring a positive marker fixed it. A false "rate limit at 300" was actually
a concurrency cap, disproved by timing sequential connections.

## 7. Attack Path and Impact

Probe the protocol → replay leaked pairs one connection at a time → a reused
credential authenticates → the account prints the flag. Impact: account
takeover via reused credentials, unimpeded by any attempt limit.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | No attempt limit | High | Needs a candidate credential list · account access when any pair is reused · affects every account whose password is reused |

No severity grade appears on the existing page; High is assigned here on the
basis above.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Add per-account and per-source rate limiting and lockout; monitor for stuffing (many accounts, one source); add MFA; encourage unique passwords | Replaying a list triggers throttling/lockout well before success; stuffing patterns are detected |

## 10. Limitations

- Steps taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-07-20, confirmed by owner).
- Severity is the author's assessment.
- The leaked list is challenge-provided; no real credentials were harvested.
- Note: the published page previously spelled out the flag value in its Takeaways; this has been redacted on the page as part of this change.

## 11. Conclusion

Unlimited login attempts turn any breach list into account takeover. Rate
limiting, lockout, stuffing detection and MFA are the fixes; unique passwords
remove the reuse the attack depends on.

## References

Checked on 2026-10-12:
- CWE-307 Improper Restriction of Excessive Authentication Attempts — https://cwe.mitre.org/data/definitions/307.html
- CWE-799 Improper Control of Interaction Frequency — https://cwe.mitre.org/data/definitions/799.html
- ATT&CK T1110.004 Brute Force: Credential Stuffing — https://attack.mitre.org/techniques/T1110/004/
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
