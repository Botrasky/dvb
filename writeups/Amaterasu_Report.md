---
title: Amaterasu
slug: amaterasu
summary: A web API lab covering path traversal, file uploads, and task permissions.
topic: web
difficulty: Medium
platform: OffSec Proving Grounds
cover: /assets/writeup-covers/amaterasu.svg
date: 2026-10-14
status: published
---

# Security Assessment Report — Amaterasu

> Flag values are withheld per repository and platform rules.

## Summary

Amaterasu is a Linux lab built around a custom Flask REST API. An unrestricted
file-listing parameter exposed the filesystem, while inconsistent validation in
the upload endpoint allowed an SSH public key to be written into a user's
`authorized_keys` file. A root cron job then trusted a user-writable directory
in its `PATH`, allowing a planted `tar` executable to run as root.

## Scope and methodology

- **Scope:** the single Amaterasu lab host provided by OffSec Proving Grounds.
- **Authorization:** the platform's isolated training environment.
- **Method:** service discovery, API enumeration, path validation testing, file
  upload analysis, SSH access, and local privilege-escalation review.

## Attack chain

1. A full-port scan identified FTP, SSH, Apache, and a Werkzeug API.
2. API documentation exposed `/file-list` and `/file-upload` endpoints.
3. The `dir` parameter accepted arbitrary paths and revealed the target user's
   home and `.ssh` directories.
4. The upload type check inspected the multipart filename, while a separate
   form field controlled the destination path.
5. A benign `.txt` multipart name passed the filter while the destination field
   traversed into `authorized_keys`.
6. The matching private key provided SSH access to the lab account.
7. A root cron script prepended a user-writable directory to `PATH` and invoked
   `tar` without an absolute path.
8. A controlled replacement executable demonstrated root-level execution.

```bash
nmap -p- -sV -T4 <target>
curl -s "http://<target>:33414/file-list?dir=/home"
ssh -i <private-key> alfredo@<target> -p 25022
```

## Findings and remediation

| Finding | Impact | Remediation |
| --- | --- | --- |
| Unrestricted directory parameter | Filesystem discovery | Resolve requested paths and enforce an approved root directory |
| Upload destination uses unvalidated input | Arbitrary file write | Generate server-side filenames and reject path separators |
| Type check and destination use different fields | Filter bypass | Validate the exact value used for storage and inspect content |
| Privileged cron job trusts writable `PATH` | Root command execution | Use absolute binary paths and remove writable directories from privileged search paths |

## Takeaways

- Every client-controlled path must be canonicalized and constrained.
- Validation must apply to the value that controls the security-sensitive action.
- Privileged automation should use absolute paths and least-privilege accounts.

