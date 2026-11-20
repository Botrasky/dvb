# Review Skill

**Purpose:** Evaluate code, architecture, security, accessibility, and content quality before work is merged or handed off.

**When to use:** After implementation is complete and before preparing a PR or merge request. Also used when one agent reviews another agent's changes.

**Scope:** Read-only analysis of changed files and their context. The reviewer proposes fixes but does not apply them unless separately authorized.

## Triggers

- An implementation phase is complete and ready for review.
- An agent is handing off work to another agent.
- The owner requests an independent review of pending changes.
- A PR is open and needs code review before merge.

## Procedure

### 1. Scope review

- Verify that only the approved files were changed: `git diff --stat`.
- Check that no out-of-scope files were modified.
- Confirm the changes align with the stated objective and plan.

### 2. Code quality

- **Astro/TypeScript:** Check prop types, content schema usage, component structure, and import paths under the active site source root.
- **CSS:** Check selector specificity, theme mode scoping, responsive behavior, and mirror sync where mirrors exist.
- **JavaScript:** Check for minimal client-side JS. Verify scripts are limited to interactions (theme, search, charts, typing, slideshows).
- **HTML:** Check semantic markup, heading hierarchy, and proper use of ARIA attributes.

### 3. Security review

- **Credentials and flags:** Use approved repository checks. Never print or quote suspected credential or flag values in review findings; redact any sensitive match.
- **External links:** Verify `target="_blank" rel="noopener noreferrer"` on external links.
- **Personal data:** No phone numbers, addresses, ID numbers, or private documents.
- **CI enforcement:** Run `bash scripts/ci-check.sh` when applicable in the current branch.

### 4. Accessibility review

- **Keyboard:** Verify focus indicators on interactive elements.
- **Labels:** Check that images have `alt` attributes (empty `alt=""` for decorative images), form inputs have labels, and ARIA attributes are correct.
- **Contrast:** Check text contrast in both supported theme modes. Do not claim a conformance level without measured evidence.
- **Reduced motion:** Verify that `prefers-reduced-motion` media queries disable non-essential animation.
- **Control states:** Check hover, focus, active, and disabled states for buttons and links.

### 5. Content review

- **Accuracy:** Do not invent facts about the owner. Verify claims against supplied information.
- **Writeup structure:** Summary → Recon → Flaw → Exploit → Takeaways. Flag always redacted.
- **Metadata:** Content collection fields are populated and valid where a collection is active.
- **Publisher marks:** Only approved publisher logos and source categories.

### 6. Architecture review

- Changes follow the current architecture and the migration/contribution guidance present on the active branch.
- No unnecessary dependencies or build steps added.
- Content, presentation, and data concerns remain separated.
- Legacy bridges are preserved until replacements are verified.

## Verification

```bash
git diff --stat              # Only approved files changed
npm run format:check         # Formatting passes
npm run check                # No type or diagnostic errors
npm run build                # Build succeeds
bash scripts/ci-check.sh     # Security and integrity checks pass when applicable
```

## Boundaries

- Reviewers propose changes but do not apply them unless separately authorized.
- Review findings do not override Codex's integration decisions without owner approval.
- Do not commit, push, merge, or deploy as part of a review.

## Handoff

Record review findings, approved items, and items needing fixes in `documentation/PROGRESS.md` or the PR description. Include the reviewer's agent name and the review date.
