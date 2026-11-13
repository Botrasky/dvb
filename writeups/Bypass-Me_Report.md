---
title: Bypass Me
slug: bypass-me
summary: A debugging exercise that reveals the limits of an input filter.
topic: re
difficulty: Medium
platform: CyLab Security Academy
cover: /assets/writeup-covers/bypass-me.svg
date: 2026-10-12
status: published
---

# Security Assessment Report — Bypass Me

> Secret and flag values are withheld per repository and platform rules.

## Summary

`bypassme.bin` is a setuid-root training binary that asks for a password and
strips digits from user input before comparing it with a decoded secret. The
blacklist is a distraction: the dynamically linked, unstripped program places
the decoded password in process memory before calling `strcmp`. A debugger can
stop at the comparison and inspect the function arguments directly.

## Scope and methodology

- **Scope:** the single Bypass Me binary and its authorized lab environment.
- **Method:** file and permission inspection, symbol review, input-behavior
  testing, and controlled dynamic analysis with LLDB.

## Analysis

The file metadata showed that the binary was dynamically linked, retained
symbols, and executed with elevated privileges. Numeric test input confirmed
that digits were removed before validation. Symbol inspection highlighted the
authentication and password-decoding functions.

Rather than reconstructing the decoder, the analysis stopped execution at
`strcmp`. Under the x86-64 calling convention, the first two string arguments
are passed through `RDI` and `RSI`. One argument contained the sanitized test
input and the other contained the program's decoded secret.

```text
(lldb) breakpoint set --name main
(lldb) run
(lldb) breakpoint set --name strcmp
(lldb) register read rdi rsi
```

The recovered value was submitted to the binary, confirming the authentication
bypass. The value itself is intentionally redacted.

## Findings and remediation

| Finding | Impact | Remediation |
| --- | --- | --- |
| Decoded secret remains in plaintext memory | Local secret disclosure | Avoid embedding reusable authentication secrets in client-side binaries |
| Digit blacklist changes input silently | Confusing and ineffective validation | Validate against an explicit accepted format and fail clearly |
| Elevated binary relies on a recoverable static secret | Privilege boundary bypass | Replace static password checks with an external, least-privilege authorization mechanism |

## Takeaways

- Input filtering does not protect a secret stored in the same process.
- Dynamic analysis can reveal transient values without reversing every function.
- Setuid programs require a much stronger trust model than local static secrets.

