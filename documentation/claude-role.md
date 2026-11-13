# claude-role.md
Model assignment strategy for Claude (claude.ai / API). Same goal as codex-role.md — stop burning Pro quota on a tier the task doesn't need.

**Critical difference from Codex CLI: there is no `/model` command in Claude.ai. Every model switch = a new chat. You cannot carry context automatically — you must manually paste what the next model needs. So pick the right model BEFORE you start, not mid-session.**

## Required task record

After every approved task, Claude must update
[`documentation/PROGRESS.md`](PROGRESS.md) before reporting completion. Record
the scope, files changed or inspected, completed work, tests or evidence,
remaining work, blockers, and owner decisions. This is a status record only; it
does not authorize commit, push, merge, or deployment actions.

Before reporting completion, verify the entry against the final diff and test
output and include the `PROGRESS.md` diff in the owner review.

Lineup as of Nov 2026: Opus 5.5 (flagship), Sonnet 5.5 (default workhorse), Haiku 5.5 (bulk/boilerplate), Fable 5.2 (safety-restricted tasks).

---

## 1. Head-Dev / Architect
**Model: Claude Opus 5.5 — use sparingly, planning only**
- System design, schema/API decisions, algorithm tradeoffs, architecture planning
- Reviewing a finished diff for structural soundness
- Breaking a vague goal into a spec Sonnet can execute
- Thinking level: High/Max (extended thinking). One pass per feature/phase — not per turn.
- Note: Opus 5.5 is cheaper than GPT-6 Astra ($4 vs $10 input, $20 vs $50 output) but still 2x Sonnet — still use it sparingly.

## 2. Technical Implementation
**Model: Claude Sonnet 5.5 — default for all code work**
- Writing/editing code against a spec already decided: FastAPI routes, SQLAlchemy models, Alembic migrations, PWA components, Astro pages/components, CSS cleanup
- Refactors, renames, applying a design system once chosen
- Writing tests
- This is where 80% of your sessions should happen.

## 3. Bug Investigator
**Model: Claude Sonnet 5.5 by default → escalate to Opus only after 2 failed attempts**
- Root-causing errors, 500s, auth/JWT issues, cluster-cooldown bugs, build/deploy failures
- First pass: paste the error, stack trace, and relevant file — Sonnet at medium thinking
- Escalate to Opus only if Sonnet fails twice OR bug spans multiple subsystems
- Trivial errors (lint, type mismatch, import typo) → Haiku

## 4. Visual / CSS Debugging (portfolio-specific)
**Model: Claude Sonnet 5.5 (Claude has strong vision — no Terra equivalent needed)**
- Paste screenshot + describe the visual problem — Sonnet handles this natively
- Claude doesn't have a Terra-equivalent split; Sonnet does both vision and code fix in one response

## 5. Bulk / Boilerplate
**Model: Claude Haiku 5.5 — protect your Sonnet/Opus quota**
- Docstrings, commit messages, README edits, repetitive CRUD stubs, config file edits
- Anything where zero reasoning is required
- Keep prompts under 100K tokens — Haiku's price jumps 5x over that threshold ($0.10 → $0.50 input)

---

## Per-token cost (Anthropic API rates, Nov 2026)
| Model | Input $/1M | Cached input | Output $/1M |
|---|---|---|---|
| Opus 5.5 | $4.00 | $0.20 | $20.00 |
| Sonnet 5.5 | $2.00 | $0.10 | $10.00 |
| Haiku 5.5 (≤100K) | $0.10 | $0.01 | $0.50 |
| Haiku 5.5 (>100K) | $0.50 | $0.05 | $2.50 |
| Fable 5.2 | $8.00 | — | $40.00 |

One Opus response ≈ 2 Sonnet responses ≈ 40 Haiku responses in cost. Unlike Astra vs Sol (5x gap), Opus vs Sonnet is only 2x — but output is still the expensive side. Keep Opus output short: spec summaries, not full implementations.

---

## How to switch models — no mid-session switching, plan ahead

**In Claude.ai there is no `/model` command.** The workflow is different from Codex CLI:

1. **Decide the model before opening the chat** based on the task type (see roles above).
2. **New model = new chat.** When switching roles (e.g. Opus plan → Sonnet implement), open a new chat on the right model and paste the relevant output from the previous chat.
3. **What to carry forward manually:**
   - Opus → Sonnet: paste the spec/plan Opus produced. Nothing else.
   - Sonnet → Opus (bug escalation): paste the error, the broken code block, and a one-line summary of what Sonnet tried.
   - Never paste the full conversation history — only the artifact the next model actually needs.
4. **Use Projects** for persistent context across sessions on the same codebase. Set the project once with your stack overview (Astro + TS, FastAPI + SQLAlchemy, cluster rules), so every new chat in the project already has that background — you don't re-paste it every time.

---

## Role reminder format — what to say at the start of each chat

**Do NOT** re-explain your whole stack or tell the model to read this file. If using Projects, context is already loaded. Just role-set + task.

### Opening Opus (Head-Dev)
```
Role: Head-Dev — planning only, no code yet.
Task: [what you want planned]
Constraints: [e.g. "FastAPI, existing schema in models.py"]
Output: Spec I can hand to Sonnet for implementation. Keep it concise.
```

### Opening Sonnet (Implementation)
```
Role: Implementation.
Spec from planning: [paste Opus output]
Task: Implement this.
```

### Opening Sonnet (Bug Investigator)
```
Role: Bug Investigator.
Error: [paste stack trace]
Relevant file: [paste broken function/block]
```

### Escalating to Opus (Bug — after Sonnet fails twice)
```
Role: Bug Investigator — diagnosis only, no rewrite yet.
Sonnet failed twice on [X].
Error: [paste]
What Sonnet tried: [brief summary]
```
Then open a new Sonnet chat → "Apply this fix: [paste Opus diagnosis]"

### Opening Haiku (Boilerplate)
```
Task: [flat one-sentence request with zero logic]
[paste the file/content to work on]
```

---

## Full session flow reference
```
START TASK
  Haiku  → boilerplate/docs only (commit msg, README, config stub)

PLANNING
  New chat → Opus
  "Role: Head-Dev. Plan [X]. Output spec for Sonnet."

IMPLEMENTATION
  New chat → Sonnet
  "Role: Implementation. Implement this spec: [paste Opus output]"

BUG (1st pass)
  New chat → Sonnet  (or continue in same Sonnet chat if still open)
  "Role: Bug Investigator. Error: [paste]. File: [paste]."

BUG (Sonnet fails twice)
  New chat → Opus
  "Role: Bug Investigator. Sonnet failed twice. Error: [paste]."
  New chat → Sonnet → "Apply this fix: [paste Opus diagnosis]"

CSS / VISUAL BUG
  New chat → Sonnet
  "Role: Visual Debug. [attach screenshot]. Describe problem + fix."

END TASK / NEW FEATURE → new chat on the right model
```

---

## Key differences vs Codex CLI workflow

| Situation | Codex CLI | Claude.ai |
|---|---|---|
| Switching roles | `/model` in same session | New chat, paste relevant output |
| Context carry | Automatic | Manual — paste only what's needed |
| Before escalating to flagship | `/compact` then `/model` | Paste only error + failed attempts |
| Persistent project context | None | Use Projects feature |
| Flagship cost | Astra $10/$50 | Opus $4/$20 — cheaper but same 2x rule applies |

**Luna for implementation: same rule applies.** Don't start on Haiku hoping to save cost — Haiku will fail on real code and you'll re-do on Sonnet. Go straight to Sonnet for anything with logic.

---

## Claude Code Desktop vs CLI — which to use

**For solo web dev (portfolio, cluster system): use Desktop app.**

| Feature | Desktop App | CLI |
|---|---|---|
| Parallel sessions | ✅ Automatic (sidebar) | Manual `-w` flag per terminal |
| Visual diff reviewer | ✅ Built-in | ❌ |
| Embedded app preview | ✅ Built-in browser | ❌ |
| PR monitoring + auto-fix | ✅ | ❌ |
| Built-in MCP connectors | ✅ GUI | Manual `~/.claude.json` edit |
| Projects + shared memory | ✅ Full support | ✅ Full support |
| Scripting / CI / SSH | ❌ | ✅ |
| Agent SDK / agent teams | ❌ | ✅ |

**Critical: sessions are siloed by surface.** A session started in Desktop cannot be resumed in CLI and vice versa. Pick one per project and don't mix.

**When to use CLI instead:**
- Deploying cluster system to Fly.io/Render — Claude in CI pipeline
- SSH into VPS
- Scripting or automating Claude calls
- Need Agent SDK features

**For now (Astro refactor + cluster system local dev): Desktop app.** Switch to CLI only when you need CI/CD integration later.
