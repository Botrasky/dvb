# Audit Skill

**Purpose:** Perform read-only repository analysis to find gaps, produce checklists, summarize state, and verify compliance with project documentation.

**When to use:** For broad reviews that do not require code changes — migration progress audits, test coverage gap analysis, route validation, accessibility surveys, and documentation consistency checks.

**Scope:** Read-only. Audits produce findings and recommendations but do not modify files.

## Triggers

- The owner requests a repository audit or gap analysis.
- A migration phase is approaching completion and needs verification against the active migration plan.
- A broad review is needed across files (route coverage, asset inventory, accessibility).
- An independent checklist is needed before a release.

## Procedure

### 1. Define the audit scope

- Clarify what is being audited: migration progress, route coverage, accessibility, security, documentation consistency, or content completeness.
- Identify the available reference documents to audit against (for example, `documentation/MIGRATION_PLAN.md` on current `main` or root `MIGRATION_PLAN.md` on the current flattened Astro `test` branch). Report missing references instead of assuming their contents.

### 2. Migration audit

Compare the current repository state against the active migration plan:

- Which phases are complete, in progress, or not started?
- Are legacy files still in use or ready for archival?
- Do Astro routes cover all legacy page routes?
- Are content collections fully populated with validated schemas?
- Are shared components replacing duplicated markup?

### 3. Route and asset audit

- Locate Astro pages under the active site's `src/pages/` directory; on current `main` this is `frontend/src/pages/`, while on the current flattened Astro `test` branch it is `src/pages/`.
- Cross-reference expected routes with `npm run check:routes` output when that script exists.
- Check for orphaned assets under the active site's public asset tree.
- Check for broken asset references using the current branch's path conventions.

### 4. Security and privacy audit

- Use approved repository checks for credential and CTF-flag detection. Do not print or quote matched credential or flag values; redact sensitive output.
- Check external link safety: `target="_blank"` should have `rel="noopener noreferrer"`.
- Verify no personal data beyond the owner's approved public profile.

### 5. Accessibility audit

- Check semantic HTML structure and heading hierarchy.
- Verify image `alt` attributes (descriptive for content images, empty for decorative).
- Check form labels, ARIA attributes, and keyboard navigation.
- Check text contrast at relevant review widths. Do not claim a conformance level without measured evidence.
- Check `prefers-reduced-motion` support for animations.

### 6. Documentation consistency audit

- Cross-reference `AGENTS.md`, `documentation/ai-agent-role-manager.md`, `documentation/architecture.md`, and the available migration/contribution guidance.
- Identify contradictions, stale references, or missing information.
- Verify that `documentation/PROGRESS.md` entries match the actual repository state.

### 7. AGY audit mode

AGY may use its supported `--mode plan` for read-only audit and planning tasks. Plan mode does not permit file edits. Do not invent an implementation flag or bypass workspace restrictions.

## Verification

- The audit report covers all items in the defined scope.
- Findings reference specific files and line numbers where possible.
- Recommendations are actionable and within the project's architectural constraints.
- The audit does not claim compliance without evidence.

## Boundaries

- Audits are read-only. Do not modify files during an audit.
- Audit findings are advisory. They do not override Codex's integration decisions.
- AGY's audit output must be independently verified before acting on it.
- If the audit reveals issues requiring code changes, report them and request a separate implementation approval.

## Handoff

Record audit findings, recommendations, and any items requiring owner decisions in `documentation/PROGRESS.md` or a dedicated audit report. Include the audit scope, date, and agent name.
