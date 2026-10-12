# Security Assessment Report — Printer Shares 3

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | CyLab Security Academy (formerly picoCTF) |
| Category | General Skills |
| Difficulty | Hard |
| Date | 2026-05-04 (confirmed by owner) |
| Environment | SMB server; reached over the network via an anonymous/null session |
| Status | Completed — flag captured |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

An SMB server exposes two shares: a world-writable one reachable with a null
session, and a protected `secure-shares` the tester cannot read. A cron job
runs a script from the writable share every minute as the `challenge` user
(uid 1001), appending output to a world-readable log. That account can read
`secure-shares`, which the anonymous SMB session cannot. Overwriting the script
with one that reads the protected flag makes the job disclose it. The root
weakness is a writable resource (the script) executed by a more-privileged
account. The fix is to own the script with a trusted account and forbid writes
over the anonymous share.

## 2. Scope and Rules of Engagement

- **In scope:** the single Printer Shares 3 SMB host.
- **Out of scope:** anything else.
- **Authorization:** CyLab Security Academy (formerly picoCTF) lab terms.
- **Window:** 2026-05-04. Times not recorded.
- **Constraints:** training challenge; actions limited to the exposed shares.

This is a deliberately vulnerable training target, not a production system.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

PTES phases: **intelligence gathering** (enumerate shares with a null session),
**vulnerability analysis** (identify the writable share feeding a cron job that
runs as another user), **exploitation / privilege abuse** (replace the script; let the cron run
it).

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target | SMB server, two shares: writable `shares`, protected `secure-shares` |
| Mechanism | cron runs `script.sh` every minute as the `challenge` user (uid 1001); stdout appended to world-readable `cron.log` |
| Tooling | smbclient, a bash payload |
| Access from | anonymous / null SMB session |

## 5. Findings

| # | Finding | Weakness type | Severity |
|---|---|---|---|
| 1 | World-writable share reachable with a null session | CWE-306 Missing Authentication for Critical Function; CWE-732 Incorrect Permission Assignment for Critical Resource | High |
| 2 | Cron job (user `challenge`, uid 1001) executes an attacker-writable script | CWE-732 Incorrect Permission Assignment for Critical Resource | High |

CVE: not applicable (custom lab).
ATT&CK: not cleanly assigned. T1021.002 (SMB/Windows Admin Shares) was considered but **does not fit** — that technique describes lateral movement via Windows admin shares (`ADMIN$`, `C$`, `IPC$`) using valid accounts, not anonymous access to a file share, so it is dropped. The privilege gain loosely relates to T1053.003 (Cron), but that technique describes *creating* cron jobs, whereas here an *existing* scheduled job's script is overwritten — cited only with that caveat.
CVSS: not assigned a single base score — the chain spans two components (anonymous share write → code execution as the `challenge` user, uid 1001, which can read the protected share but is not root). Rated by the qualitative grid (template policy).

## 6. Technical Analysis and Validation

### Finding 1 — Writable share via null session
- **Observation.** `smbclient -L` with `-N` (no credentials) listed a public, writable `shares` holding `script.sh` and `cron.log`, and a `secure-shares` that returned ACCESS_DENIED.
- **Analysis.** A critical resource (a script run by another user's scheduled job) is writable without authentication. Weaknesses: CWE-306 (no auth) and CWE-732 (over-permissive write). Precondition: network access to SMB.
- **Validation.**
  ```
  smbclient -L //$H -p $P -N
  smbclient //$H/shares -p $P -N -c 'get script.sh; get cron.log'
  ```

### Finding 2 — Privileged cron runs the writable script
- **Observation.** `cron.log` gained one new line per minute, confirming a one-minute cron job running the script as the `challenge` user (uid 1001) — confirmed by the payload's WHOAMI output in `cron.log`. The replacement payload's `find / -iname 'flag*'` returned some unrelated files matching "flag" (noise) before the real target at `/challenge/secure-shares/flag.txt`, and the flag appeared directly inside `cron.log`, not in a separate file.
- **Analysis.** A more-privileged account's job consumes a file the attacker controls, so the attacker's code runs as the `challenge` user (uid 1001) — enough to read `secure-shares`, which the anonymous session cannot. Not root, but sufficient for the objective. Weakness: CWE-732. Precondition: write access from Finding 1.
- **Validation.** Replaced `script.sh` with one that enumerates and cats any `flag*` file; after the next tick the flag appeared in `cron.log`:
  ```bash
  for f in $(find / -iname 'flag*' 2>/dev/null); do echo ">> $f"; cat "$f" 2>&1; done
  ```
  ```
  smbclient //$H/shares -p $P -N -c 'put script.sh'   # wait ~60s
  >> /challenge/secure-shares/flag.txt
  ```
  **Flag captured.**

## 7. Attack Path and Impact

Null SMB session → list shares → write to the public share → overwrite the
cron script → the `challenge` user's cron executes it → the flag from the
protected share is written to the readable log. Impact: disclosure of a resource
the anonymous session could not reach, via a more-privileged account's job.

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · gain · scope) |
|---|---|---|---|
| 1 | Writable share, null session | High | Only network access · write to an input used by another user's job · enables Finding 2 |
| 2 | Cron (challenge, uid 1001) runs writable script | High | Needs write access · code execution as `challenge` (uid 1001) · reads the protected share, not root |

No severity grades appear on the existing page; assigned here on the basis
above.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Require authentication for the share; remove anonymous write | Null-session write is refused |
| 2 | Own the script with a trusted account, not writable over the anonymous share; run the job with least privilege | Overwriting the script fails; cron runs only the intended, protected script |

## 10. Limitations

- Steps taken from the existing writeup, not reproduced by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Only the date is owner-supplied (2026-05-04, confirmed by owner).
- Severities are the author's assessment.
- The cron job runs as `challenge` (uid 1001), confirmed via WHOAMI in `cron.log`; the host beyond the two shares and this job was not enumerated.
- Lab finding; intentionally vulnerable configuration.

## 11. Conclusion

A writable input to another user's scheduled job is a direct path to that
account's privileges. Lock down ownership and permissions on anything a cron job
executes.

## References

Checked on 2026-10-12:
- CWE-306 Missing Authentication for Critical Function — https://cwe.mitre.org/data/definitions/306.html
- CWE-732 Incorrect Permission Assignment for Critical Resource — https://cwe.mitre.org/data/definitions/732.html
- ATT&CK T1053.003 Scheduled Task/Job: Cron — https://attack.mitre.org/techniques/T1053/003/ (cited with caveat; see section 5)
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
