# Shared Skill

**Purpose:** Common checks, conventions, and coordination procedures used across all task phases.

**When to use:** Before and after every task phase. This skill supplements every other skill.

**Scope:** Repository-wide. Provides coordination and verification guidance; it does not independently authorize changes.

## Procedure

### Before starting any task

1. Read `AGENTS.md` and `documentation/ai-agent-role-manager.md`.
2. Run `git branch --show-current` and `git status --short --branch`. Record existing changes and preserve work you did not create.
3. Read the relevant skill file for the current task phase.
4. Identify the approved scope — exact files, intended behavior, and boundaries.
5. Confirm paths and available scripts against the current branch. Do not assume another branch's layout.

### During work

- Follow the Universal Owner-Control Protocol in `AGENTS.md`.
- Stay within the approved file scope. Stop and report if an out-of-scope file needs changes.
- Use `documentation/` (not `docs/`) for repository documentation paths.
- Use consistent formatting and run the current branch's `npm run format:check` before reporting results.

### After completing work

1. Run checks relevant to the changed files and record their actual results.
2. Update `documentation/PROGRESS.md` as required by the approved scope and repository instructions. Preserve existing history; append a factual entry rather than replacing prior records.
3. Present the complete diff and test evidence to the owner.

## Verification

Choose applicable checks from `npm run format:check`, `npm run check`, `npm run build`, `npm run check:routes`, `git diff --check`, and `bash scripts/ci-check.sh`. Documentation-only changes generally need formatting and whitespace checks; run repository integrity checks when required by the branch's contribution guidance. Use scripts defined by the current `package.json`.

## Conventions

- **Branches:** Use the branch workflow documented for the current task and branch; feature branches normally target `test` before production promotion.
- **Commit messages:** Descriptive, prefixed (`feat:`, `fix:`, `docs:`, `chore:`). Attribute AI contributions.
- **CTF flags:** Never include real flag values in published content, diffs, or reports.
- **Credentials:** Never commit. If accidentally committed, revoke first, then remove.
- **File mirrors:** When a matching asset mirror exists, keep source and published copies in sync.
- **Branch-aware paths:** On current `main`, site files are under `frontend/`; on current Astro `test`, they are at the repository root. Verify before acting.

## Boundaries

- This skill does not authorize file edits, commits, pushes, PRs, merges, or deployments.
- Agents with owner-approved implementation scope may edit only the designated files while following these procedures.
- AGY uses `--mode plan` for audit tasks; this is not an implementation flag.

## Handoff

Record results in `documentation/PROGRESS.md` when required. Include the agent, approved scope, files changed, completed work, observed test evidence, blockers, and owner decisions needed.
