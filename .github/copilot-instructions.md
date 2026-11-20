# Instructions for GitHub Copilot & Codex

This repository is the **ZEUS Cybersecurity Portfolio** (`https://zeuswriteups.vercel.app`), owned and directed by **Vathanak Botra Dos (@Botrasky)**.

## Core Rules & Governance

1. **Mandatory Operating Rules:** Always consult `AGENTS.md` and follow the Universal Owner-Control Protocol before editing or proposing code.
2. **Agent Skills:** Repository-wide skill guides live in `documentation/skills/`. Consult `documentation/agent-skills.md` to load the appropriate phase skill (`shared/SKILL.md` + your current task skill).
3. **Role & Integrator:** Codex is Lead Integrator & Co-Lead Implementer (see `documentation/codex-role.md`).
4. **Security & Redaction:** Never commit real CTF flags (redact to `[REDACTED]`), credentials, or secrets.
5. **Starting Baseline & Branch Protocol:** Never edit directly on `main` or `test`. If starting on `main`, cut `fix/...` for docs/hotfixes or switch to `test` and cut `feat/...` for Astro features/writeups. Work only on the feature branch and merge through PRs.
