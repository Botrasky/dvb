---
title: Electron1
slug: electron1
summary: A Linux lab about exposed credentials and an outdated service.
topic: web
difficulty: Medium
platform: OffSec Proving Grounds
cover: /assets/writeup-covers/electron1.svg
date: 2026-10-16
status: published
---

# Security Assessment Report — Electron1

> Password and flag values are withheld per repository and platform rules.

## Summary

Electron1 exposes SSH and an Apache-hosted eLection application. Directory
listing on the application's log directory revealed a cleartext password. The
same credential was reused by a local SSH account, providing an initial shell.
SUID enumeration then identified a vulnerable Serv-U binary affected by
CVE-2019-12181, which enabled local privilege escalation.

## Scope and methodology

- **Scope:** the single Electron1 lab host provided by OffSec Proving Grounds.
- **Method:** service and directory discovery, exposed-log review, controlled
  credential validation, SSH access, and SUID vulnerability assessment.

## Attack chain

1. Port scanning identified SSH and HTTP.
2. Web enumeration located the eLection administration area and an indexed log
   directory.
3. A served log file contained an application-assigned password in cleartext.
4. The password was reused by the corresponding system account and provided
   SSH access.
5. SUID enumeration revealed `/usr/local/Serv-U/Serv-U` running as root.
6. The version and behavior matched CVE-2019-12181, allowing controlled root
   command execution in the isolated lab.

```bash
nmap -sC -sV <target>
gobuster dir -u http://<target>/ -x php,txt
find / -perm -4000 -type f 2>/dev/null
```

## Findings and remediation

| Finding | Impact | Remediation |
| --- | --- | --- |
| Web-accessible directory listing | Sensitive file discovery | Disable indexes and deny access to application logs |
| Cleartext password in logs | Credential disclosure | Redact secrets and centralize protected logging |
| Credential reuse between application and SSH | Host compromise | Use unique credentials and disable password SSH where possible |
| Vulnerable SUID Serv-U binary | Root privilege escalation | Patch or remove the binary and review all non-standard SUID files |

## Takeaways

- Logs are sensitive data stores and must never contain reusable credentials.
- Credential reuse turns an application leak into operating-system access.
- Non-standard SUID binaries deserve immediate version and necessity review.

