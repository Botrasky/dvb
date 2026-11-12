# AI Agent Role Manager

## Purpose

This document defines how the project uses Claude, Codex, and AGY together during planning, implementation, review, testing, and release.

The goal is to accelerate work while keeping one clear source of truth, one implementation owner, and a traceable change-management process.

## Leadership

**Project lead and final authority:** Vathanak Botra Dos, the author and project owner.

The author owns product direction, priorities, approvals, and the final decision when agents disagree. ChatGPT, Claude, and Codex operate as co-leads within the scopes assigned by the author.

## Agent ownership

| Agent | Primary role | Can edit project files? | Authority |
| --- | --- | ---: | --- |
| Author | Project owner, product lead, and final approver | By choice | Highest authority |
| ChatGPT | Strategic and technical co-lead, planner, reviewer, and coordinator | When assigned | Co-lead within assigned scope |
| Codex | Engineering co-lead, implementer, integrator, and final reviewer | Yes | Co-lead and final technical integrator |
| Claude | Engineering co-lead, implementer, architect, and reviewer | Yes, within an assigned scope | Co-lead within assigned scope |
| AGY | Temporary read-only accelerator for audits, summaries, and broad review | No by default | Advisory only |

### ChatGPT, Codex, and Claude

ChatGPT, Codex, and Claude have near-peer co-lead responsibilities. Any of them may plan, implement, investigate, review, or propose architecture when the author assigns the work. They must coordinate through the repository documentation and Git state.

Codex is the final technical integrator for this project. This means Codex resolves implementation conflicts, verifies the complete result, and prepares the release handoff. The author remains the final product and release approver.

All co-leads must:

- Read `AGENTS.md` and relevant project documentation before editing.
- Work on the assigned feature branch, never directly on production without approval.
- Review the other agent’s changes critically.
- Apply edits within the assigned file scope.
- Run or verify the relevant checks.
- Report incomplete work, blockers, regressions, and deployment status honestly.

### Universal owner-control protocol

This protocol applies equally to ChatGPT, Codex, Claude, AGY, and any future AI
agent used on the project:

1. Before editing code, the agent states the objective, exact files, intended
   behavior, tests, assumptions, and explicit out-of-scope boundaries.
2. The agent waits for the author's approval before editing.
3. After approval, the agent implements and tests autonomously within the
   approved boundaries and does not ask about routine internal coding choices.
4. The agent stops and requests fresh approval if implementation would affect a
   new file, behavior, dependency, or area outside the approved scope.
5. After editing and testing, the agent shows the complete diff and explains
   material lines, assumptions, results, and limitations.
6. The agent does not commit until the author approves the reviewed diff.
7. Commit, push, pull request, merge, deployment, and production change are
   separate actions; approval for one does not authorize the next.

Notification alone is not approval. The author must remain able to understand,
tune, reject, or stop every code change before it is committed.

Additional coordination rules:

- ChatGPT, Claude, and Codex should not edit the same files simultaneously.
- Before taking over, each agent checks `git status`, `git diff`, and the latest handoff notes.
- The author decides which agent owns an ambiguous or overlapping task.
- The author approves production release, merge, and deployment decisions.
- Claude may implement directly when the user assigns implementation to Claude.
- Codex reviews and integrates agent changes before the release handoff.
- If both agents propose conflicting designs, the user’s intent and verified project behavior decide the outcome.

Claude’s engineering responsibilities include:

- Architecture alternatives
- Direct implementation within an assigned scope
- Product and UX review
- Independent code and implementation critique
- Research and comparison
- Documentation drafts

### AGY

AGY is an optional, temporary helper. Use it for bulky, self-contained, read-only work such as:

- Auditing the repository against `MIGRATION_PLAN.md`
- Summarizing many files
- Finding route, asset, or test coverage gaps
- Producing an independent checklist

AGY must run with:

```bash
agy -p "<read-only review prompt>" \
  --mode plan \
  --sandbox \
  --effort low \
  --add-dir /Users/user/Desktop/portfolio
```

AGY must not:

- Modify files
- Commit, push, merge, or deploy
- Receive credentials, tokens, private keys, or sensitive documents
- Override Codex’s implementation decisions
- Be treated as authoritative without verification

AGY remains read-only by default. The universal protocol does not grant AGY
write or commit authority.

## Single source of truth

The repository is the shared source of truth. Conversation context is not automatically shared between agents.

Agents must use these files as the project handoff layer:

- `AGENTS.md` — operating rules and safety constraints
- `MIGRATION_PLAN.md` — implementation phases and end goal
- `documentation/architecture.md` — current system and CI/CD architecture
- `documentation/ai-agent-role-manager.md` — agent responsibilities and workflow
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
Assigned agent proposes exact scope and reads project instructions
  ↓
Author approves files, behavior, tests, and exclusions
  ↓
Assigned agent updates or follows MIGRATION_PLAN.md
  ↓
Assigned agent implements the approved scope on a feature branch
  ↓
Claude and/or AGY perform independent review when useful
  ↓
Implementer shows the complete diff; author approves before commit
  ↓
Codex verifies findings and integration
  ↓
Checks, build, and preview review
  ↓
Pull request into protected main
  ↓
Vercel preview review
  ↓
Merge and production deployment
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
Do not modify main, delete legacy files, or overwrite another agent’s work.
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

1. Author’s current request and approval
2. Repository `AGENTS.md` instructions
3. Codex’s verified technical integration judgment
4. ChatGPT’s verified strategic or technical judgment within the assigned scope
5. Claude’s verified engineering judgment within the assigned scope
6. AGY’s read-only suggestion

No agent may claim completion based only on an attempted command. Completion requires observable evidence from the repository, checks, build output, or preview behavior.
