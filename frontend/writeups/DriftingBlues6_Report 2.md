---
title: DriftingBlues6
slug: driftingblues6
summary: A CMS lab covering exposed backups, upload permissions, and an old kernel flaw.
topic: web
difficulty: Easy
platform: OffSec Proving Grounds
cover: /assets/writeup-covers/driftingblues6.svg
date: 2026-10-16
status: published
---

# Security Assessment Report — DriftingBlues6

> Credential and flag values are withheld per repository and platform rules.

## Summary

DriftingBlues6 exposes Apache with Textpattern CMS 4.8.3. `robots.txt` revealed
the administrative path, while extension-aware directory discovery found a
password-protected backup archive. Recovering the archive password exposed a
valid CMS credential. An authenticated file-upload weakness provided a shell,
and the end-of-life kernel remained vulnerable to Dirty COW, allowing local
privilege escalation.

## Scope and methodology

- **Scope:** the single DriftingBlues6 lab host provided by OffSec Proving
  Grounds.
- **Method:** service discovery, web-content enumeration, authorized password
  recovery, CMS version analysis, exploit review, and kernel assessment.

## Attack chain

1. A full-port scan found one public Apache service.
2. `robots.txt` disclosed the Textpattern administrator path and a backup hint.
3. Directory discovery with the `.zip` extension found `spammer.zip`.
4. The weak archive password was recovered from an offline hash.
5. The extracted credential authenticated to Textpattern.
6. The CMS version was affected by authenticated arbitrary file upload
   behavior associated with CVE-2021-47888.
7. The resulting shell exposed an obsolete Linux 3.2 kernel.
8. CVE-2016-5195 (Dirty COW) demonstrated local privilege escalation in the lab.

```bash
nmap -p- --min-rate 2000 <target>
gobuster dir -u http://<target>/ -x zip
zip2john spammer.zip > spammer.hash
```

## Findings and remediation

| Finding | Impact | Remediation |
| --- | --- | --- |
| Backup archive in public webroot | Credential disclosure | Store backups outside served directories and restrict access |
| Weak archive password | Offline recovery | Use strong unique encryption keys and rotate exposed credentials |
| Outdated Textpattern CMS | Authenticated code execution | Upgrade to a supported patched release and restrict uploads |
| End-of-life vulnerable kernel | Root privilege escalation | Upgrade the operating system and kernel; remove unsupported hosts |

## Takeaways

- Backup files deserve the same access controls as production data.
- Reading and adapting public exploit code is part of safe validation.
- Application patching cannot compensate for an unsupported operating system.

