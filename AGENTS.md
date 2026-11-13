# Rules for AI Agents (Codex & Others)

This repository is the **ZEUS Cybersecurity Portfolio** (`https://vathanakbotra.vercel.app`), owned and directed by **Vathanak Botra Dos (@Botrasky)**.

## Role Overview
- **Codex:** Lead Integrator & Co-Lead Implementer. Resolves code conflicts, verifies full builds/checks, and prepares release handoffs. (See `documentation/codex-role.md`).
- **Claude:** Architect & Co-Lead Implementer. (See `CLAUDE.md` and `documentation/claude-role.md`).
- **AGY:** Read-Only Auditor. Never edits or commits.
- **Detailed Governance:** Archived at `documentation/archive/ai-agent-role-manager.md`.

## Allowed Without Asking
- Read anything in the repo.
- Inspect Git status, diff, branches, and commit history.
- Propose plans, file scopes, tests, and architecture alternatives.
- Run non-mutating checks against the working tree.

## Universal Owner-Control Protocol
1. **Scope:** State the objective, exact files to change, intended behavior, tests, and boundaries.
2. **Wait for Approval:** Do NOT edit code before owner approval.
3. **Autonomous Execution:** Work within approved scope without asking about routine code choices.
4. **Boundary Limit:** Stop immediately if a new file or out-of-scope change is needed.
5. **Diff Review:** Show the complete diff and explain material lines and test results.
6. **Commit Approval:** Do NOT commit until the owner approves the diff.
7. **Action Independence:** Approval to commit does NOT authorize push, PR, merge, or deployment.
8. **Progress Record:** After every approved task, update [`documentation/PROGRESS.md`](documentation/PROGRESS.md) before reporting completion. Record the approved scope, files changed or inspected, completed work, tests or evidence, remaining work, blockers, and owner decisions needed. This record does not authorize any Git or release action.

Before reporting completion, verify that the progress entry is present, matches
the final diff and test output, and is included in the reviewed change set.

## Non-Negotiable Rules
- **Never push to `main`**, force-push, or rewrite git history.
- **Never commit CTF flags** (redact flags to `[REDACTED]`), credentials, or secrets.
- **Never invent claims** or facts about the owner.
- **Always attribute AI contributions** in commit or PR descriptions.
