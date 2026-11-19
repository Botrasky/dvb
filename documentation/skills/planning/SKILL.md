# Planning Skill

**Purpose:** Define the scope, design, and implementation plan for a new feature, refactor, or content addition before any code changes begin.

**When to use:** At the start of work on a feature branch, before editing production code or content.

**Scope:** Produces design documents, task breakdowns, and scope agreements. No production code modifications during this phase.

## Triggers

- A new feature request or refactor is proposed.
- A migration phase needs a detailed implementation plan.
- Multiple files or systems will be affected and coordination is needed.

## Procedure

### 1. Gather context

- Read `AGENTS.md`, the available migration and architecture guidance, and `documentation/ai-agent-role-manager.md`. If an expected document is missing, report that rather than assuming its contents.
- Run `git status --short --branch` and `git log -5 --oneline --decorate`.
- Identify which routes, components, styles, data/content definitions, and public assets are affected.

### 2. Define scope

- State the objective, exact files to change, intended behavior, and boundaries.
- List what is explicitly out of scope.
- Identify dependencies on other pending work or branches.

### 3. Draft the plan

- Present the task breakdown as a checklist. Create a planning file only when it is included in the approved scope.
- For Astro/TypeScript work: note affected layouts, components, content configuration, and route files.
- For CSS/UI work: note which stylesheets, breakpoints (390/768/1280/1440 px), and theme modes are affected.
- For content work: note collection schema fields, metadata requirements, and publisher/cover image needs.

### 4. Review

- Present the plan to the owner for approval before proceeding.
- Identify the assigned implementer and reviewer. Codex remains the technical integrator; AGY may implement only within an explicitly approved scope.

## Verification

- The plan document exists and covers objective, files, behavior, tests, and boundaries.
- The owner has approved the scope before any implementation begins.
- The plan has been presented to the owner and approved before implementation.

## Boundaries

- Do not edit production code, components, stylesheets, or content until the plan is approved.
- Do not change canonical domain settings, Vercel project configuration, or branch protection.
- Planning documents go in `documentation/`, not `docs/`.

## Handoff

Record planning completion in `documentation/PROGRESS.md` when required by the approved scope or repository instructions.
