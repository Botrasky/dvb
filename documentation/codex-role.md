# codex-role.md
Model assignment strategy for Codex work across both projects (portfolio-website Astro refactor, cluster-job-hunt-system FastAPI/PWA). Goal: stop burning weekly ChatGPT Plus quota on a model tier the task doesn't need.

Lineup as of Nov 2026 (OpenAI Work/Codex surface): GPT-6 Astra (flagship, ~5x cost), GPT-6.1 Sol (near-Astra, Sol-tier price), GPT-6.1 Terra (visual reasoning / computer use), GPT-6 Luna (cheap, fast, bulk).

---

## 1. Head-Dev / Architect
**Model: GPT-6 Astra — use sparingly, planning sessions only**
- System design, schema/API contract decisions, cluster-engine algorithm tradeoffs, Astro refactor architecture (folder structure, content collections, CSS methodology choice)
- Reviewing a finished PR/diff for structural soundness before merge
- Breaking a vague goal into a spec the implementation role can execute without re-deciding anything
- Thinking level: High/Max. Keep sessions short and infrequent — one planning pass per feature/phase, not per turn.

## 2. Technical Implementation
**Model: GPT-6.1 Sol — default workhorse**
- Writing/editing code against a spec already decided by Head-Dev: FastAPI routes, SQLAlchemy models, Alembic migrations, PWA components, Astro pages/components, CSS cleanup
- Refactors, renames, applying a design system once chosen
- Writing tests
- Thinking level: Medium. This is where 80% of your usage should go — it's priced like Sol but benchmarks near Astra, so don't escalate to Astra here unless Sol visibly fails twice.

## 3. Bug Investigator
**Model: GPT-6.1 Sol by default → escalate to Astra only after 2 failed attempts**
- Root-causing failing tests, 500s, auth/JWT issues, cluster-cooldown logic bugs, build/deploy errors
- First pass: give Sol the error, stack trace, and relevant file — medium thinking
- If Sol's fix doesn't hold after 2 tries, or the bug spans multiple subsystems (e.g. cooldown + conflict detection interacting), escalate that one session to Astra at High thinking
- For trivial errors (lint, type mismatch, import typo): don't even use Sol — drop to Luna

## 4. Visual/CSS Debugging (portfolio-specific)
**Model: GPT-6.1 Terra**
- Anything where you're pasting a screenshot: layout breaking, CSS specificity fights, responsive issues on the messy legacy styling
- Terra's strength is visual reasoning + computer use, not raw coding depth — use it to diagnose, then hand the fix to Sol (Implementation) to actually write

## 5. Bulk / Boilerplate
**Model: GPT-6 Luna — protect your Sol/Astra quota**
- Docstrings, commit messages, README sections, repetitive CRUD scaffolding, simple config file edits
- Anything you'd be comfortable not reviewing closely

---

## Rule of thumb
Escalate one tier at a time (Luna → Sol → Astra), never jump straight to Astra "to be safe." Astra should be a handful of sessions per week, not a default. Thinking level is its own lever — drop a model to Instant/Low for anything mechanical even if it's assigned a higher-tier model for other tasks.

---

## Per-token cost (OpenAI API rates, standard tier, <272K context)
| Model | Input $/1M | Cached input | Output $/1M |
|---|---|---|---|
| GPT-6 Astra | $10.00 | $1.00 | $50.00 |
| GPT-6.1 Sol | $2.00 | $0.10 | $10.00 |
| GPT-6.1 Terra | $1.00 | — | $5.00 |
| GPT-6 Luna | $0.10 | $0.01 | $0.50 |

Astra's output alone is 100x Luna's and 5x Sol's. One Astra response ≈ 8 Sol responses ≈ 500 Luna responses in cost. Simulated weekly mix following the roles above: ~$3.81; same mix if everything ran on Astra: ~$13.40. The role assignments exist specifically to avoid that 3.5x drain.

---

## How to switch models — same session, not a new chat
Codex CLI's `/model` command switches mid-session and carries the full conversation context forward to the new model instantly — no need to start over. Use this, not a new chat, for normal role handoffs (plan on Astra → implement on Sol → debug on Sol).

**Workflow per task:**
1. `/new` when starting a genuinely new feature/task — don't drag unrelated old context forward, it inflates every future input-token bill regardless of which model reads it.
2. Within one task, use `/model` to move between roles (Head-Dev → Implementation → Bug Investigator) as needed. Context carries automatically.
3. **Before switching UP to Astra**, run `/compact` first. Astra charges 5x Sol's input rate — a long Sol conversation history that gets compacted down costs far less to re-read once Astra takes over. Compacting then escalating is cheaper than escalating with full history intact.
4. Use `/status` periodically to see current model and token usage, so you know when context is getting large enough that a compact (or a `/new`) is worth it before your next response.
5. Switching back down to Sol/Luna after an Astra session is free of penalty — just `/model` again. The only real cost to avoid is carrying a bloated context *into* Astra.

Rule of thumb: `/new` = different task. `/model` = different role, same task. `/compact` = right before escalating to Astra.

---

## How to prompt after a model switch — role reminder format

**Do NOT** re-explain your stack, re-paste history, or tell the model to read this file. Context already carries. All you need is a one-line role-setter + the task.

### Switching INTO Astra (Head-Dev)
```
/compact
/model → Astra

Role: Head-Dev (planning only — no code yet)
Task: [what you want planned]
Constraints: [e.g. "FastAPI, existing schema in models.py"]
Output: Spec I can hand to Sol for implementation
```

### Switching INTO Sol (Implementation)
```
/model → Sol

Role: Implementation
Task: Implement this spec — [paste Astra's plan]
```

### Switching INTO Sol (Bug Investigator)
```
/model → Sol   ← already on Sol in most cases, no switch needed

Role: Bug Investigator
Error: [paste stack trace]
Relevant file: [paste the broken function/block]
```

### Escalating to Astra after Sol fails twice (Bug)
```
/compact
/model → Astra

Role: Bug Investigator
Sol failed twice on [X]. Here's the error: [paste]
Diagnosis only — no rewrite yet.
```
Then `/model` → Sol → "Apply this fix: [paste Astra's diagnosis]"

---

## Full session flow reference
```
START TASK
  /new  ← fresh context
  Luna  → boilerplate/docs only (commit msg, README, config stub)

PLANNING
  /compact → /model Astra
  "Role: Head-Dev. Plan [X]. Output spec for Sol."

IMPLEMENTATION
  /model Sol
  "Role: Implementation. Implement this spec: [paste]"

BUG (1st pass)
  stay on Sol
  "Role: Bug Investigator. Error: [paste]. File: [paste]."

BUG (Sol fails twice)
  /compact → /model Astra
  "Role: Bug Investigator. Sol failed twice. Error: [paste]."
  /model Sol → "Apply this fix: [paste]"

CSS / VISUAL BUG
  /model Terra
  "Role: Visual Debug. Screenshot: [paste]. Diagnose only."
  /model Sol → "Apply this fix: [paste]"

END TASK / NEW FEATURE → /new
```

**Luna for implementation: skip it.** Luna's ceiling is too low for real code (FastAPI logic, Astro components, cluster rules). Starting on Luna then failing to Sol costs *more* — you pay Luna tokens + repeat on Sol for the same task. Go straight to Sol unless the task is pure boilerplate with zero logic.
