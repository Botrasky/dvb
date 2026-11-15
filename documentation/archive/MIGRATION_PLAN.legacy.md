# ZEUS Portfolio Migration Handoff

## Current state

- Working branch: `feat/astro-refactor-threat-feed`
- Production/main was not modified.
- Legacy static site files remain in place while the migration is staged.
- Existing CI checks pass with `bash scripts/ci-check.sh`.

## Completed

- Improved the threat feed presentation with official publisher logos, source categories, publication dates, original-source links, and a credibility cue.
- Added safer external-link attributes (`target="_blank" rel="noopener noreferrer"`).
- Fixed feed typing animation resuming after a hidden tab becomes visible.
- Added initial Astro + TypeScript architecture:
  - `astro.config.mjs`
  - `package.json`
  - `tsconfig.json`
  - `.nvmrc` requiring Node `22.23.4`
  - `src/layouts/SiteLayout.astro`
  - `src/components/ThreatBrief.astro`
  - `src/pages/index.astro`
  - initial `writeups`, `author`, and `portfolio` routes

## Important environment note

Astro installed successfully, but Astro 7 requires Node `>=22.23.4`. Run:

```bash
nvm install
nvm use
npm run check
npm run build
```

## Next implementation steps

1. Run the Astro check and build after switching to Node 22.23.4.
2. Resolve any Astro compile errors before migrating more pages.
3. Move the existing writeup Markdown files into a typed Astro content collection.
4. Convert the remaining legacy portfolio and author pages into Astro routes.
5. Add a typed Astro API route or deployment adapter for `/api/security-brief`.
6. Preserve the existing visual design and verify all navigation paths.
7. Add formatting, accessibility, and end-to-end checks to CI.

## Guardrails

- Do not delete the legacy HTML/CSS/JS until the Astro build is visually and functionally verified.
- Do not touch `main` or production branches.
- Leave the pre-existing untracked file `Icon\r` untouched.

## Part 2: Complete implementation plan

### Phase 2.1 — Stabilize the Astro foundation

Goal: make the new Astro application reproducible and safe to extend.

Tasks:

1. Keep Node pinned to `22.23.4` through `.nvmrc` and `package.json` engines.
2. Replace floating `latest` dependency ranges with pinned, compatible versions.
3. Keep `package-lock.json` committed for reproducible installs.
4. Confirm `npm run check` and `npm run build` pass on a clean install.
5. Add `.astro/`, `dist/`, and `node_modules/` to `.gitignore`.
6. Confirm the Astro output directory and deployment base URL are correct.

Acceptance criteria:

- A new checkout can install dependencies and build using the documented Node version.
- No generated output is tracked by Git.
- The build completes without warnings that affect runtime behavior.

### Phase 2.2 — Migrate the shared visual system

Goal: preserve the current ZEUS design while removing duplicated page structure.

Tasks:

1. Move shared CSS imports into a deliberate Astro style entry point.
2. Create reusable components for:
   - Header and navigation
   - Theme switcher
   - Footer
   - Page heading and eyebrow labels
   - Cards and buttons
3. Keep responsive breakpoints and reduced-motion behavior consistent.
4. Replace relative legacy script paths with Astro-managed scripts.
5. Add accessible active navigation states and keyboard focus states.

Acceptance criteria:

- Shared navigation and footer are defined once.
- Dark/light theme works on every Astro route.
- Mobile, keyboard, and reduced-motion behavior remain usable.

### Phase 2.3 — Migrate assets and branding

Goal: make every image, logo, favicon, and cover work in the Astro build.

Tasks:

1. Copy or import the existing `assets/` tree into Astro’s supported asset pipeline.
2. Include the favicon in the generated output.
3. Import all official publisher marks used by the threat feed.
4. Preserve certificate and writeup-cover image quality.
5. Add explicit alt text rules:
   - Decorative images use empty alt text.
   - Informational images describe their content.
   - Publisher marks identify the publisher.
6. Verify every referenced asset exists in `dist/`.

Acceptance criteria:

- No asset request returns 404 in the production build.
- The ZEUS brand mark and publisher logos render in dark and light themes.
- The build contains the favicon, certificates, and writeup covers.

### Phase 2.4 — Build typed writeup content

Goal: replace manually maintained writeup HTML with typed Markdown content.

Tasks:

1. Create an Astro content collection for writeups.
2. Define a schema for:
   - Title
   - Slug
   - Summary
   - Topic
   - Difficulty
   - Platform
   - Cover image
   - Publication date
   - Status
3. Move the existing Markdown reports into the collection.
4. Convert the existing writeup detail pages into a dynamic route such as `[slug].astro`.
5. Preserve code blocks, diagrams, tables, methodology sections, and references.
6. Generate the writeup index from collection data.
7. Add topic and difficulty filtering without duplicating content.

Acceptance criteria:

- Every currently published writeup has an Astro route.
- Every writeup card links to a real generated page.
- Invalid slugs return a deliberate 404 page.
- No published CTF flags or sensitive material are introduced.

### Phase 2.5 — Migrate the portfolio and author pages

Goal: replace placeholder routes with the full existing portfolio content.

Tasks:

1. Convert the current author page into Astro components.
2. Convert the current portfolio/about page into Astro sections.
3. Preserve experience, education, credentials, projects, charts, and contact anchors.
4. Move repeated timeline/card structures into data objects or typed collections.
5. Add metadata and social preview information for each route.

Acceptance criteria:

- `/author/` and `/portfolio/` contain the same or improved content as the legacy pages.
- All internal navigation and contact anchors work.
- No personal information is unintentionally exposed beyond the existing public site.

### Phase 2.6 — Migrate the threat-feed API

Goal: keep live publisher and vulnerability data working after the Astro cutover.

Tasks:

1. Move the feed parser into a typed server module.
2. Create the Astro-compatible API route for `/api/security-brief`.
3. Preserve publisher host allowlists and image host allowlists.
4. Preserve RSS parsing, NVD filtering, deduplication, and freshness limits.
5. Keep timeout and failure behavior safe when one publisher is unavailable.
6. Keep the UI fallback picks available when the API returns no items.
7. Validate external links before exposing them to the browser.

Acceptance criteria:

- `/api/security-brief` returns the documented JSON shape.
- A failed publisher does not break the complete feed.
- The browser shows live stories when available and trusted fallback stories otherwise.
- No arbitrary external image or link is accepted by the API.

### Phase 2.7 — Add automated quality gates

Goal: make GitHub Actions and Vercel prevent broken changes from reaching production.

Tasks:

1. Update GitHub Actions to run:
   - Dependency installation from the lockfile
   - Formatting check
   - Astro type/content check
   - Existing repository checks
   - Production build
   - Link and asset validation
   - Accessibility smoke checks
2. Configure pull requests as the normal merge path.
3. Protect `main` from direct pushes.
4. Require all CI checks before merging.
5. Connect Vercel to GitHub:
   - Feature branches create preview deployments.
   - Pull requests show the preview URL.
   - `main` creates production deployments.
6. Add a deployment smoke test against the preview URL.

Acceptance criteria:

- A failing check blocks the pull request.
- Every pull request has a reviewable preview deployment.
- Production deploys only after the protected-branch requirements pass.

### Phase 2.8 — Visual and functional parity review

Goal: prove the Astro version is at least as good as the legacy site before cutover.

Review matrix:

| Area | Legacy behavior | Astro verification |
| --- | --- | --- |
| Homepage | Dashboard, threat brief, labs, author strip | Same content and improved source trust UI |
| Threat feed | Live feeds, fallback picks, slideshow | API, fallback, logos, dates, animation |
| Writeups | Index, filters, detail pages | Collection index, filters, dynamic routes |
| Author | Bio and credentials | Migrated content and metadata |
| Portfolio | Experience and contact | Migrated sections and anchors |
| Theme | Dark/light persistence | Shared layout behavior on every route |
| Responsive | Mobile/tablet/desktop | Visual checks at defined breakpoints |
| Accessibility | Keyboard and reduced motion | Focus, labels, landmarks, motion preference |
| SEO | Titles, description, sitemap, robots | Astro metadata and generated files |

Acceptance criteria:

- No critical route, asset, or API regressions remain.
- Desktop and mobile screenshots are reviewed for each major route.
- Lighthouse and accessibility checks meet the agreed baseline.

### Phase 2.9 — Cutover and cleanup

Goal: move production to Astro without losing a rollback path.

Tasks:

1. Open a pull request from the feature branch into `main`.
2. Review the Vercel preview deployment.
3. Run the complete CI and visual review checklist.
4. Merge only after required checks pass.
5. Confirm the production deployment and key routes.
6. Keep the legacy implementation available in Git for rollback.
7. Remove obsolete legacy files only in a later cleanup pull request, after production stability is confirmed.
8. Update `MIGRATION_PLAN.md` with the final architecture and deployment notes.

Final end-goal definition:

- Astro is the production application.
- All published pages and writeups have working routes.
- The threat feed uses the migrated API and trusted source metadata.
- GitHub Actions is the required quality gate.
- Vercel preview and production deployments are connected to the branch workflow.
- `main` is protected and production-safe.
- Legacy files are retained until rollback is no longer needed.
