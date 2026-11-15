---
title: "ColddBox: Easy"
slug: coldbox-easy
summary: A WordPress lab about weak credentials and unsafe system permissions.
topic: web
difficulty: Easy
platform: OffSec Proving Grounds
cover: /assets/writeup-covers/coldbox-easy.svg
date: 2026-10-16
status: published
---

# Security Assessment Report — ColddBox: Easy

> Password and flag values are withheld per repository and platform rules.

## Summary

ColddBox is a Linux lab running an outdated WordPress installation. A public
note exposed account information, WordPress author enumeration confirmed valid
users, and a weak shared password provided administrative access. WordPress's
theme editor then enabled controlled code execution. A SUID copy of `find`
allowed the web foothold to become a root shell.

## Scope and methodology

- **Scope:** the single ColddBox lab host provided by OffSec Proving Grounds.
- **Method:** network and directory discovery, WordPress enumeration,
  credential validation, authorized theme modification, and SUID review.

## Attack chain

1. Service scanning identified SSH and an older WordPress site.
2. Directory enumeration found a hidden page containing an internal password
   sharing note and several usernames.
3. WordPress author-ID enumeration independently confirmed the accounts.
4. A controlled password test identified a weak credential for an administrator.
5. The authenticated theme editor was used to demonstrate server-side code
   execution and obtain a low-privilege shell.
6. SUID enumeration revealed `/usr/bin/find` with elevated permissions.
7. The documented SUID behavior of `find` demonstrated root command execution.

```bash
nmap -sC -sV -p- -T4 <target>
wpscan --url http://<target>/ --enumerate u
find / -perm -4000 -type f 2>/dev/null
```

## Findings and remediation

| Finding | Impact | Remediation |
| --- | --- | --- |
| Public internal note | Username and process disclosure | Remove internal material from the webroot and require authentication |
| Weak shared WordPress password | Administrative compromise | Enforce unique passwords, MFA, and login throttling |
| Theme editor permits code changes | Server-side execution after admin compromise | Disable in-dashboard file editing and restrict filesystem permissions |
| SUID bit on `find` | Root privilege escalation | Remove unnecessary SUID permissions and audit privileged binaries |
| Unsupported WordPress version | Increased known-vulnerability exposure | Upgrade to a supported release and maintain patching |

## Takeaways

- Small information leaks can make credential attacks practical.
- Administrative convenience features expand the impact of account compromise.
- Privileged filesystem permissions should be reviewed continuously.

