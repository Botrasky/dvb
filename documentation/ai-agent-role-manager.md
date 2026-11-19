# AI Agent Role Manager

## Purpose

This document defines how the project uses ChatGPT, Claude, Codex, and AGY during planning, implementation, review, testing, and release.

The goal is to accelerate work while keeping one clear source of truth, one implementation owner, and a traceable change-management process.

## Leadership

**Project lead and final authority:** Vathanak Botra Dos, the author and project owner.

The author owns product direction, priorities, approvals, and the final decision when agents disagree. ChatGPT, Claude, and Codex operate as co-leads within the scopes assigned by the author. AGY may implement within an explicitly owner-approved scope but does not gain independent release authority.

## Agent ownership

| Agent | Primary role | Can edit project files? | Authority |
| --- | --- | ---: | --- |
| Author | Project owner, product lead, and final approver | By choice | Highest authority |
| ChatGPT | Strategic and technical co-lead, planner, reviewer, and coordinator | When assigned | Co-lead within assigned scope |
| Codex | Engineering co-lead, implementer, integrator, and final reviewer | Yes | Co-lead and final technical integrator |
| Claude | Engineering co-lead, implementer, architect, and reviewer | Yes, within an assigned scope | Co-lead within assigned scope |
| AGY | Auditor with limited, scoped implementation capability | Designated files only, after explicit owner approval | May implement within scope; Codex remains the final technical integrator |

### Agent collaboration

ChatGPT, Codex, and Claude have co-lead responsibilities. Any assigned agent, including AGY, may plan, implement, investigate, or review within the owner's approved scope. Agents must coordinate through repository documentation and Git state.

Codex is the final technical integrator for this project. This means Codex resolves implementation conflicts, verifies the complete result, and prepares the release handoff. The author remains the final product and release approver.

All co-leads must:

- Read `AGENTS.md` and relevant project documentation before editing.
- Work on the assigned feature branch, never directly on production without approval.
- Review the other agent's changes critically.
- Apply edits within the assigned file scope.
- Run or verify the relevant checks.
- Report incomplete work, blockers, regressions, and deployment status honestly.

Additional coordination rules:

- No agents should edit the same files simultaneously.
- Before taking over, each agent checks `git status`, `git diff`, and the latest handoff notes.
- The author decides which agent owns an ambiguous or overlapping task.
- The author approves production release, merge, and deployment decisions.
- Claude may implement directly when the user assigns implementation to Claude.
- Codex reviews and integrates agent changes before the release handoff.
- If both agents propose conflicting designs, the user's intent and verified project behavior decide the outcome.

Claude's engineering responsibilities include:

- Architecture alternatives
- Direct implementation within an assigned scope
- Product and UX review
- Independent code and implementation critique
- Research and comparison
- Documentation drafts

### AGY

AGY is primarily an auditor and may also implement within an explicitly owner-approved scope. Suitable work includes:

- Auditing the repository against `MIGRATION_PLAN.md`
- Summarizing many files
- Finding route, asset, or test coverage gaps
- Producing an independent checklist
- Implementing code or documentation changes within an explicitly owner-approved scope

#### Audit tasks

For audit and read-only review tasks, configure AGY with the approved repository workspace and use its supported plan mode. Plan mode is for audit and planning output only; it is not an implementation mode. Do not invent an implementation flag or bypass workspace restrictions.

#### Owner-approved implementation

When the owner explicitly approves a scoped implementation task, AGY may edit **only the designated files** named in that approval. AGY must follow the scope, review, verification, and progress-record requirements in `AGENTS.md`.

The following restrictions remain **unconditional** and are never relaxed by an implementation approval:

- AGY must not commit, push, open a PR, merge, or deploy.
- AGY must not receive credentials, tokens, private keys, or sensitive documents.
- AGY must not bypass workspace or sandbox restrictions to reach files outside its approved workspace.
- AGY must not override Codex's final integration decisions.
- AGY's output must not be treated as authoritative without independent verification.

## Single source of truth

The repository is the shared source of truth. Conversation context is not automatically shared between agents.

Agents must use these files as the project handoff layer:

- `AGENTS.md` — operating rules and safety constraints
- `MIGRATION_PLAN.md` — implementation phases and end goal
- `documentation/architecture.md` — current system and CI/CD architecture
- `documentation/ai-agent-role-manager.md` — agent responsibilities and workflow
- `documentation/agent-skills.md` — skill index and cross-references
- Git branch, status, diff, and commit history — actual change state

Before acting, an agent should check:

```bash
git branch --show-current
git status --short --branch
git log -5 --oneline --decorate
```

## Change-management workflow

```text
Request
  ↓
Codex clarifies scope and reads project instructions
  ↓
Codex updates or follows MIGRATION_PLAN.md
  ↓
Assigned agent implements within the approved scope on a feature branch
  ↓
Claude and/or AGY may perform an independent review when useful
  ↓
Codex verifies findings and applies fixes
  ↓
Checks, build, and preview review
  ↓
Pull request into test (staging)
  ↓
Staging review and pull request from test into protected main
  ↓
Vercel preview review and owner-approved merge
  ↓
Production deployment
```

## Branch rules

- `main` is the production branch and must remain protected.
- Feature work uses a dedicated branch such as `feat/astro-refactor-threat-feed`.
- Only one agent should edit a given file set at a time.
- Agents must not silently switch branches.
- No force-push, reset, or destructive cleanup without explicit approval.
- Existing untracked user files must be preserved unless the user explicitly requests otherwise.

## Handoff protocol

When handing work to another agent, provide:

1. Current branch name
2. Current Git status
3. Files changed
4. Completed plan items
5. Remaining plan items
6. Checks run and their results
7. Known risks or blockers
8. Exact next action

Recommended handoff prompt:

```text
Read AGENTS.md, MIGRATION_PLAN.md, and documentation/ai-agent-role-manager.md.
Inspect the current branch and Git diff before acting.
Continue only from the documented remaining steps.
Do not modify main, delete legacy files, or overwrite another agent's work.
```

## Review gates

Codex should not mark a phase complete until the relevant gate passes:

| Gate | Required evidence |
| --- | --- |
| Scope | The task is mapped to a plan item |
| Implementation | Intended source files changed only |
| Static checks | Formatting, type, link, and repository checks pass |
| Build | Production build completes successfully |
| Runtime | Preview route and key interactions work |
| Security | No credentials, flags, unsafe links, or untrusted inputs added |
| Review | Codex has verified external agent suggestions |
| Release | Pull request and deployment path are ready |

## Change record template

For material changes, record the following in the handoff or pull request:

```markdown
### Change
- What changed:
- Why it changed:
- Agent that implemented it:
- Reviewer:

### Verification
- Commands run:
- Build result:
- Preview result:
- Known limitations:

### Release
- Branch:
- Pull request:
- Vercel preview:
- Production status:
```

## Final decision rule

When agents disagree, the order of authority is:

1. Author's current request and approval
2. Repository `AGENTS.md` instructions
3. Codex's verified technical integration judgment
4. ChatGPT's verified strategic or technical judgment within the assigned scope
5. Claude's verified engineering judgment within the assigned scope
6. AGY's verified implementation or audit judgment within its approved scope

No agent may claim completion based only on an attempted command. Completion requires observable evidence from the repository, checks, build output, or preview behavior.
