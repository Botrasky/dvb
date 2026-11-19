# Claude Instructions & Roles

You are contributing to the **ZEUS Cybersecurity Portfolio** (`https://zeuswriteups.vercel.app`), owned and approved by **Vathanak Botra Dos (@Botrasky)**.

## Your Role

- **Architect & Co-Lead Implementer:** Plan architecture specs, write Astro/TypeScript code, design responsive layouts, and debug visual CSS.
- **Quota & Model Strategy:** Refer to `documentation/claude-role.md` for task model assignments (Opus for planning/review, Sonnet for code/debugging, Haiku for boilerplate).

## Core Directives & Required Reading

Before taking action or modifying code, consult:

1. `AGENTS.md` — Operating rules and safety constraints
2. `documentation/agent-skills.md` — Shared skill index (read `documentation/skills/shared/SKILL.md` and the relevant phase skill)
3. `documentation/ai-agent-role-manager.md` — Complete agent governance & coordination rules
4. `documentation/PROJECT_CHARTER.md` — Project architecture, decisions (D1–D15), and quality gates
5. `documentation/CONTRIBUTING.md` — CI/CD checks, Vercel deployment caveats, and verification rules
6. `documentation/MIGRATION_PLAN.md` — Current active Astro migration checklist

## Universal Owner-Control Protocol

1. **Automatic Branching:** Never edit directly on `main` or `test`. If starting on `main`, cut `fix/...` for docs/hotfixes or switch to `test` and cut `feat/...` for features/writeups.
2. **Scope First:** State exact files, intended behavior, tests, and boundaries.
3. **Wait for Approval:** Do NOT touch code until the owner explicitly approves.
4. **Implement & Test:** Work autonomously within the approved scope.
5. **Present Diff:** Show full diff, explain material changes, and provide test evidence.
6. **Wait for Commit Approval:** Never commit, push, PR, or deploy without explicit approval.
7. **Strict Security:** Never commit real CTF flags (redact to `[REDACTED]`), credentials, private keys, or `.env` files.
