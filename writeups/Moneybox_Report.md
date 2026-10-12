# Security Assessment Report — Moneybox

| Field | Value |
|---|---|
| Assessment type | Authorized CTF / lab exercise |
| Platform | OffSec Proving Grounds |
| Category | Pentesting |
| Difficulty | Easy |
| Date | 2026-10-11 (confirmed by owner) |
| Environment | Linux host (Debian), reached over the network from a single attacker machine |
| Status | Completed — local and root flags captured (2/2) |
| Author | Dos Vathanak Botra |

> Flag values are withheld per repo policy and platform rules.

---

## 1. Executive Summary

Moneybox is an Easy-rated Linux lab host. It was fully compromised by chaining a
series of minor information leaks rather than a single exploit: anonymous FTP
handed over an image, a public web page leaked the passphrase that unlocked data
hidden in that image, the hidden note named a user with a weak password, and from
that first shell a reused SSH key and a permissive `sudo` rule led to root.

No single weakness here was severe on its own. The target falls because each
service gives away a little and the leaks compound. The most important fix is the
`sudo NOPASSWD` rule on the Perl interpreter, which turns any low-privilege shell
into root.

This was a deliberately vulnerable training target, not a production system. No
third-party data was involved.

## 2. Scope and Rules of Engagement

- **In scope:** the single Moneybox lab host (one IP, provided by the platform).
- **Out of scope:** anything outside that host.
- **Authorization:** OffSec Proving Grounds lab terms; the host is provisioned for this exercise.
- **Window:** 2026-10-11. Exact times not recorded.
- **Constraints:** single-user lab; no destructive actions required or taken.

## 3. Methodology

Based on the author's quick notes taken during the lab, not a formal log.

Phases followed (PTES phase names):

1. **Intelligence gathering** — port and service discovery; FTP, web and SSH enumeration.
2. **Vulnerability analysis** — identifying the leaked passphrase, the hidden data, and the weak credential.
3. **Exploitation** — steganographic extraction, SSH password guessing.
4. **Post-exploitation** — lateral movement via reused key, privilege escalation via sudo.

Automated: `nmap`, `gobuster`, `hydra`. Manual: image triage, reading page
source, the sudo escalation.

## 4. Technical Environment

| Item | Detail |
|---|---|
| Target OS | Linux (Debian) |
| Services | FTP vsftpd 3.0.3 (21), SSH OpenSSH 7.9p1 (22), HTTP Apache 2.4.38 (80) |
| Tooling | nmap, ftp, gobuster, steghide, hydra, ssh |
| Access from | single attacker machine on the network, no credentials given |

## 5. Findings

| # | Finding | Weakness type (CWE) | ATT&CK | Severity |
|---|---|---|---|---|
| 1 | Anonymous FTP exposes a file | CWE-306 Missing Authentication for Critical Function | T1552.001 Credentials In Files | Medium |
| 2 | Secret key in HTML source comments | CWE-615 Inclusion of Sensitive Information in Source Code Comments | T1552.001 Credentials In Files | Medium |
| 3 | Secret hidden in a publicly served image | CWE-538 Insertion of Sensitive Information into Externally-Accessible File or Directory | T1552.001 Credentials In Files | Medium |
| 4 | Weak SSH password, no lockout | CWE-521 Weak Password Requirements; CWE-307 Improper Restriction of Excessive Authentication Attempts | T1110.001 Password Guessing; T1021.004 SSH | High |
| 5 | SSH private key reused across accounts | CWE-522 Insufficiently Protected Credentials | T1021.004 Remote Services: SSH | High |
| 6 | `sudo NOPASSWD` on the Perl interpreter | CWE-250 Execution with Unnecessary Privileges; CWE-266 Incorrect Privilege Assignment | T1548.003 Sudo and Sudo Caching | High |

CVE: not applicable (custom lab — configuration and credential weaknesses, no software vulnerability was exploited).
ATT&CK per finding is shown in the table above; reconnaissance used T1046 Network Service Discovery (a methodology step, not a per-finding weakness).
CVSS: supplied for Finding 6, the one finding mapping to a deployable software weakness — 7.8 (High), `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H` (see section 8). Findings 1–5 are configuration, content-exposure, or credential issues chained within the lab and are not assigned a CVSS base score (template policy).

## 6. Technical Analysis and Validation

### Finding 1 — Anonymous FTP exposes a file
- **Observation.** The service scan reported anonymous FTP login permitted, listing one file, `trytofind.jpg`.
- **Analysis.** A critical function (file retrieval) with no authentication. Weakness: CWE-306. Precondition: none beyond network access.
- **Validation.** Logged in as `anonymous` with a blank password and downloaded the file:
  ```
  ftp <target>
  Name: anonymous   Password: <blank>
  ftp> ls -la
  -rw-r--r-- 1 0 0 1093656 Feb 26 2021 trytofind.jpg
  ftp> get trytofind.jpg
  ```

### Finding 2 — Secret key in HTML source comments
- **Observation.** `/blogs/` carried an HTML comment naming a second directory; that directory's source held a second comment disclosing a secret key.
- **Analysis.** Sensitive data left in comments served to every visitor. Weakness: CWE-615. Precondition: ability to view the page (public).
- **Validation.** Directory brute-forcing surfaced the path; the key was read from page source:
  ```
  gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -x php,txt,html
  <!-- the hint is the another secret directory is S3cr3t-T3xt -->
  <!.. Secret Key <redacted> >
  ```

### Finding 3 — Secret hidden in a publicly served image
- **Observation.** `trytofind.jpg` (from Finding 1) contained steganographically embedded data. Triage (`exiftool`, `strings`, `binwalk`, `xxd | tail`) showed no appended data and a clean JPEG end marker, indicating embedded rather than appended content.
- **Analysis.** A secret placed in a web/FTP-accessible file. Weakness: CWE-538. Precondition: access to the file plus the passphrase (leaked in Finding 2).
- **Validation.** Extracted with the key from Finding 2 as the steghide passphrase:
  ```
  steghide extract -sf trytofind.jpg -p <key>
  wrote extracted data to "data.txt"
  ```
  `data.txt` was addressed to user **renu** and warned the password was weak.

### Finding 4 — Weak SSH password, no lockout
- **Observation.** An online wordlist attack against SSH for user `renu` recovered the password.
- **Analysis.** A guessable password combined with no attempt throttling. Weaknesses: CWE-521 (weak password), CWE-307 (no lockout). Precondition: a valid username (obtained in Finding 3).
- **Validation.**
  ```
  hydra -l renu -P <wordlist> ssh://<target> -t 4
  [22][ssh] login: renu password: <redacted>
  ```
  SSH as `renu` succeeded; the local flag was readable. `renu` had no sudo rights (`sudo -l` denied). **Flag captured.**

### Finding 5 — SSH private key reused across accounts
- **Observation.** `renu`'s shell history referenced generating an SSH key and copying it to a second user, `lily`. A hash comparison showed `renu`'s public key was the entire contents of `lily`'s `authorized_keys`.
- **Analysis.** One user's key authorizes login as another. Weakness: CWE-522. Precondition: a shell as the first user (Finding 4).
- **Validation.**
  ```
  sha256sum ~/.ssh/id_rsa.pub /home/lily/.ssh/authorized_keys
  886437...5732  /home/renu/.ssh/id_rsa.pub
  886437...5732  /home/lily/.ssh/authorized_keys
  ```
  Login as `lily` with the matching private key succeeded with no password prompt.

### Finding 6 — `sudo NOPASSWD` on the Perl interpreter
- **Observation.** `lily` could run the Perl interpreter as root without a password.
- **Analysis.** A general-purpose interpreter granted root via sudo can spawn a root shell. Weaknesses: CWE-250, CWE-266. Precondition: a shell as `lily` (Finding 5). This is the GTFOBins Perl technique.
- **Validation.**
  ```
  lily@MoneyBox:~$ sudo -l
      (ALL : ALL) NOPASSWD: /usr/bin/perl
  lily@MoneyBox:~$ sudo perl -e 'exec "/bin/sh";'
  # id
  uid=0(root) ...
  ```
  Root shell obtained; root flag readable. **Flag captured.**

## 7. Attack Path and Impact

Network access → anonymous FTP (image) → web source (passphrase) → steghide
(username + weak-password hint) → SSH guess as `renu` (local flag, unprivileged)
→ reused key to `lily` → sudo Perl to root (root flag). Each hop supplies the
precondition for the next. Final impact: full compromise of the host (root).

## 8. Risk Assessment

Severity uses the single grid defined in [REPORT_TEMPLATE.md](REPORT_TEMPLATE.md) — Critical / High / Medium / Low / Informational — rated on prerequisites, attacker gain, and scope beyond the lab. CVSS is applied per the template's policy.

| # | Finding | Severity | Basis (prerequisites · attacker gain · scope) |
|---|---|---|---|
| 1 | Anonymous FTP | Medium | No prereq · hands over a file but not direct access · an info leak, not control |
| 2 | Secret in HTML comments | Medium | No prereq · leaks a passphrase · only useful chained to Finding 3 |
| 3 | Secret in served image | Medium | Needs the file + passphrase · yields a username and hint · chained value |
| 4 | Weak SSH password, no lockout | High | Needs a username · yields an interactive shell + local flag · the foothold |
| 5 | SSH key reuse | High | Needs the first shell · a second account with no new secret · widens access |
| 6 | sudo NOPASSWD Perl | High | Needs any shell as `lily` · full root · total compromise of the host |

Findings 1–3 match the existing page; 4–6 are High on the basis above
(Finding 6 reasoned below). Basis is the author's assessment.

**Finding 6 — severity basis (High).** Rated **High** to match CVSS 3.1, which
scores this **7.8 (High)**, vector `AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`. The
score is High rather than Critical because exploitation requires local access
and an existing low-privilege foothold (`AV:L`, `PR:L`). Given that foothold
(reached earlier in this same chain), the sudo-Perl rule yields complete root
control of the host — which is why it remains the single most important fix in
this chain even at High.

## 9. Remediation and Retesting

| # | Fix | Retest |
|---|---|---|
| 1 | Disable anonymous login in vsftpd; remove the service if unused | Attempt anonymous login — should be refused |
| 2 | Strip comments and hidden paths from public pages | View page source — no keys/paths present |
| 3 | Never store secrets in web/FTP-accessible files | Confirm no secret-bearing files are served |
| 4 | Enforce key-based auth, `PasswordAuthentication no`, add lockout (fail2ban) | Password login refused; repeated attempts throttled |
| 5 | Audit every `authorized_keys`; remove cross-account key reuse | No user's key present in another user's file |
| 6 | Remove NOPASSWD on interpreters; interpreters cannot be exposed via sudo safely | `sudo -l` shows no interpreter entry; escalation fails |

## 10. Limitations

- All exploitation steps are drawn from the existing writeup, not observed by the report author — based on quick notes taken during the lab, not a formal engagement log.
- Exact testing times not recorded; only the date (2026-10-11, confirmed) is owner-supplied.
- Severity bases in section 8 are the author's assessment, not an owner-stated scale.
- This is a lab; findings reflect an intentionally vulnerable configuration and may not generalize to production.

## 11. Conclusion

Moneybox was fully compromised by chaining low-severity information leaks into a
root shell. The single most important fix is removing the `sudo NOPASSWD` rule on
the Perl interpreter (Finding 6), which converts any foothold into full control.

## References

Checked on 2026-10-12:
- CWE-306 Missing Authentication for Critical Function — https://cwe.mitre.org/data/definitions/306.html
- CWE-615 Inclusion of Sensitive Information in Source Code Comments — https://cwe.mitre.org/data/definitions/615.html
- CWE-538 Insertion of Sensitive Information into Externally-Accessible File or Directory — https://cwe.mitre.org/data/definitions/538.html
- CWE-521 Weak Password Requirements — https://cwe.mitre.org/data/definitions/521.html
- CWE-307 Improper Restriction of Excessive Authentication Attempts — https://cwe.mitre.org/data/definitions/307.html
- CWE-522 Insufficiently Protected Credentials — https://cwe.mitre.org/data/definitions/522.html
- CWE-250 Execution with Unnecessary Privileges — https://cwe.mitre.org/data/definitions/250.html
- CWE-266 Incorrect Privilege Assignment — https://cwe.mitre.org/data/definitions/266.html
- ATT&CK T1046 Network Service Discovery — https://attack.mitre.org/techniques/T1046/
- ATT&CK T1552.001 Unsecured Credentials: Credentials In Files — https://attack.mitre.org/techniques/T1552/001/
- ATT&CK T1110.001 Brute Force: Password Guessing — https://attack.mitre.org/techniques/T1110/001/
- ATT&CK T1021.004 Remote Services: SSH — https://attack.mitre.org/techniques/T1021/004/
- ATT&CK T1548.003 Abuse Elevation Control Mechanism: Sudo and Sudo Caching — https://attack.mitre.org/techniques/T1548/003/
- PTES (Penetration Testing Execution Standard) — https://pentest-standard.readthedocs.io/
- NIST SP 800-115, Technical Guide to Information Security Testing and Assessment — https://nvlpubs.nist.gov/nistpubs/legacy/SP/nistspecialpublication800-115.pdf

CVE: not applicable (custom lab).
