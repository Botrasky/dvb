# ZEUS Project Progress

Last updated: 2026-11-20

This is the shared execution record for this branch. It records verified task
scope, changes, evidence, remaining work, and owner decisions. It does not
authorize commits, pushes, pull requests, merges, or deployments.

## 2026-11-20 — Shared agent skill system

### Approved scope

- Branch: `feat/agent-skill-system`
- Create repository-wide, platform-neutral skill documentation for AI agents.
- Clarify AGY's permission to implement only within an explicitly
  owner-approved file scope; keep commit and release actions unconditionally
  prohibited.
- Update the agent guidance and add this progress record. No application code,
  dependency, deployment, or Git release changes are in scope.

### Files changed

- `AGENTS.md`
- `documentation/ai-agent-role-manager.md`
- `documentation/agent-skills.md`
- `documentation/skills/shared/SKILL.md`
- `documentation/skills/planning/SKILL.md`
- `documentation/skills/implementation/SKILL.md`
- `documentation/skills/debugging/SKILL.md`
- `documentation/skills/review/SKILL.md`
- `documentation/skills/testing/SKILL.md`
- `documentation/skills/release/SKILL.md`
- `documentation/skills/audit/SKILL.md`
- `documentation/PROGRESS.md`

### Completed

- Added an index and eight phase-oriented skills for shared workflow, planning,
  implementation, debugging, review, testing, release, and audit.
- Updated `AGENTS.md` to point agents to the skill library and document the
  owner-control protocol.
- Updated the role manager to distinguish AGY's scoped implementation
  permission from Codex's integration role and preserve AGY's unconditional
  commit, push, PR, merge, deployment, secret-access, and workspace-boundary
  restrictions.
- Aligned repository paths and validation guidance with the Astro source tree
  on this branch. Did not add application code or dependencies.

### Files inspected

- `AGENTS.md`
- `CONTRIBUTING.md`
- `MIGRATION_PLAN.md`
- `documentation/architecture.md`
- `documentation/ai-agent-role-manager.md`
- `package.json`

### Verification

| Command | Result |
| --- | --- |
| `npm run format:check` | Passed (exit 0; all matched files formatted). |
| `prettier --check` on the task documentation files | Passed (exit 0). |
| `git diff --check` | Passed (exit 0; no whitespace errors in tracked changes). |
| `bash scripts/ci-check.sh` | Passed (exit 0; repository integrity checks passed). |

`npm run check`, `npm run build`, and `npm run check:routes` were not run
because this change is documentation only and does not modify application
code.

### Remaining work and decisions

- Initial changes were committed as `40696b4` and pushed to
  `origin/feat/agent-skill-system`.
- Opening a pull request into `test` requires separate owner approval.
- Promotion from `test` to `main`, merge, and deployment remain unperformed and
  require their own approvals.
- No other blocker is known.

## 2026-11-20 — Font and canonical domain updates for test preview

### Approved scope

- Branch: `feat/font-domain-preview` (branched from `origin/test` in worktree `font-domain-preview/`).
- Update the canonical site domain to `https://zeuswriteups.vercel.app` in `astro.config.mjs`, `CONTRIBUTING.md`, `robots.txt`, and `sitemap.xml`.
- Load Google Fonts (Inter and IBM Plex Mono) and set `--font-ui` and `--font-code` variables in `css/base.css` and `public/css/base.css`, bumping `polish.css` query to `v=3`.
- Update static base stylesheet cache query parameter to `font-inter-plex` in `index.html`, `about.html`, `author.html`, and `writeups/index.html`.
- Run full verification suite and prepare progress entry.

### Files changed

- `CONTRIBUTING.md`
- `about.html`
- `astro.config.mjs`
- `author.html`
- `css/base.css`
- `documentation/PROGRESS.md`
- `index.html`
- `public/css/base.css`
- `robots.txt`
- `sitemap.xml`
- `writeups/index.html`

### Files inspected

- `astro.config.mjs`
- `AGENTS.md`
- `CLAUDE.md`
- `.github/pull_request_template.md`
- `scripts/check-build-routes.mjs`
- `scripts/ci-check.sh`

### Completed

- Configured `site` to `https://zeuswriteups.vercel.app` in `astro.config.mjs`.
- Updated domain references and verification commands in `CONTRIBUTING.md`, `robots.txt`, and `sitemap.xml`.
- Added Google Fonts import and configured `--font-ui` and `--font-code` CSS custom properties in `css/base.css` and `public/css/base.css`.
- Invalidated cache queries on static HTML pages (`font-inter-plex`).
- Verified build and routes with no errors, warnings, or broken references.
- Progress record updated.
- Committed as `9dedcc7` and pushed `feat/font-domain-preview`.
- Opened PR #98 into `test`: https://github.com/Botrasky/dvb/pull/98.

### Verification

| Command | Result |
| --- | --- |
| `npm run check` | Passed (exit 0; 39 files checked, 0 errors, 0 warnings, 0 hints). |
| `npm run build` | Passed (exit 0; static and server entrypoints bundled in 1.82s). |
| `npm run check:routes` | Passed (exit 0; 18 HTML pages, local links and assets, Vercel slash routes). |
| `bash scripts/ci-check.sh` | Passed (exit 0; all integrity, token, file size, and credential checks passed). |
| `git diff --check` | Passed (exit 0; no whitespace errors). |

### Remaining work and decisions

- Owner review of the PR's Vercel preview across light/dark themes and mobile/desktop widths; then check the browser-review item.
- Owner review and approval before merging into `test`. Promotion from `test` to `main` remains a separate PR and approval.
