# Implementation Skill

**Purpose:** Guide the process of writing code, content, and configuration changes within the ZEUS portfolio's Astro/TypeScript stack.

**When to use:** After the owner has approved a scoped implementation task and the planning phase is complete.

**Scope:** Editing approved files only — Astro components, TypeScript modules, CSS stylesheets, content collection entries, configuration, and documentation.

## Triggers

- An approved plan exists with a defined file scope and intended behavior.
- The owner has explicitly authorized the implementation.

## Procedure

### 1. Pre-implementation checks

- Confirm the branch and working tree state: `git status --short --branch`.
- Read the approved scope and verify which files may be changed.
- Read the shared skill (`documentation/skills/shared/SKILL.md`) for conventions.
- Determine the active site source root. On current `main`, it is `frontend/`; on current Astro `test`, it is the repository root. Confirm against the checked-out tree and `astro.config.mjs`.

### 2. Astro/TypeScript changes

- **Layouts:** Use `<site-root>/src/layouts/`.
- **Components:** Use `<site-root>/src/components/` and the established prop types.
- **Routes:** Add or modify pages in `<site-root>/src/pages/`, following existing route and trailing-slash conventions.
- **Content:** Follow the active content model and the actual content directories configured by `<site-root>/src/content.config.ts`. Do not assume a schema or collection path.
- **Type safety:** Run `npm run check` after relevant changes and report observed diagnostics.

### 3. CSS/UI changes

- **Source files:** Use `<site-root>/css/`.
- **Mirrors:** If a corresponding stylesheet exists under `<site-root>/public/css/`, keep the mirror in sync.
- **Dark/light mode:** Dark mode is the default. Light mode uses `.light-mode` class on `<html>`. Scope light-mode overrides carefully.
- **Responsive:** Test at 390, 768, 1280, and 1440 px widths. Use existing breakpoint variables.
- **Glassmorphism:** Dashboard glass effects use `@supports (backdrop-filter: blur(20px))` with solid fallbacks.

### 4. Content changes

- **Writeups:** Follow the active content model and applicable migration guidance. Root-level or branch-specific legacy instructions may differ; report conflicts rather than applying them blindly.
- **Metadata:** Ensure all required content collection fields are populated. Optional fields should have sensible defaults.
- **Images:** Use the existing asset location for the route being changed; Astro-served static assets belong under `<site-root>/public/`.
- **Flag redaction:** Always use `[REDACTED]` for CTF flag values. Never commit the actual flag string.

### 5. API and data changes

- **Threat Brief:** The Security Brief aggregation fetches from trusted RSS/NVD sources at deployment time.
- **Trusted sources:** Only add sources from the approved publisher list. New publishers need owner approval.
- **Fallback data:** Maintain a static fallback dataset for when live fetching fails.

### 6. Post-implementation

- Run the relevant verification checks from the shared skill.
- Present the complete diff to the owner with explanations of material changes.

## Verification

```bash
npm run check               # Astro/TypeScript diagnostics
npm run build               # Successful production build
npm run check:routes        # All routes and assets valid
npm run format:check        # Formatting passes
git diff --check            # No whitespace or merge-marker issues
```

For CSS mirror sync, compare the actual source and published files in the active site tree.

## Boundaries

- Edit only the files named in the approved scope.
- Stop and report if an out-of-scope file needs changes.
- Do not commit, push, open a PR, merge, or deploy without separate owner approval.
- Do not add new dependencies without owner approval.
- Do not change Vercel configuration, domain settings, or branch protection.
- Do not change `AGENTS.md`, `CONTRIBUTING.md`, or `scripts/ci-check.sh` unless explicitly approved.

## Handoff

Update `documentation/PROGRESS.md` with: agent name, approved scope, files changed, completed work, test evidence, remaining work, blockers, and owner decisions needed.
