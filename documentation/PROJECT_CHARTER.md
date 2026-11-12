# PROJECT CHARTER: ZEUS Cybersecurity Portfolio

Companion documents: `MIGRATION_PLAN.md`, `documentation/architecture.md`,
`documentation/ai-agent-role-manager.md`, `AGENTS.md`, and `CONTRIBUTING.md`.

## Document control

| Field                            | Value                                                     |
| -------------------------------- | --------------------------------------------------------- |
| Project                          | ZEUS — Zone for Exploration and Understanding of Security |
| Repository                       | `Botrasky/dvb`                                            |
| Product owner and final approver | Vathanak Botra Dos                                        |
| Technical integrator             | Codex, under the owner's direction                        |
| Status                           | Draft for owner review                                    |
| Version                          | 0.1                                                       |
| Last updated                     | 2026-11-11                                                |
| Production URL                   | `https://vathanakbotra.vercel.app`                        |

This charter defines purpose, scope, outcomes, architecture decisions,
governance, quality standards, and release authority. `MIGRATION_PLAN.md`
defines implementation phases. `AGENTS.md` and `CONTRIBUTING.md` define
operating constraints. When documents conflict, the owner's current written
decision and `AGENTS.md` take precedence until the documentation is corrected.

---

## 1. Project purpose

ZEUS is a public cybersecurity learning and professional portfolio platform. It
publishes practical lab writeups, explains security concepts, presents the
author's verified experience and education, and surfaces current information
from trusted security publishers.

The project exists to make technical work easy to explore, credible to review,
safe to publish, and maintainable as the content library grows.

## 2. Vision

Deliver an elegant, accessible, and trustworthy cybersecurity portfolio that:

1. teaches through clear, reproducible, redacted writeups;
2. demonstrates the author's real skills without inventing claims;
3. remains fast and readable on mobile and desktop;
4. separates content, presentation, and live data concerns;
5. can be changed safely through typed content, automated checks, previews,
   owner review, and controlled production releases.

## 3. Problem statement

The legacy site grew from manually connected HTML, CSS, and JavaScript files.
That approach made shared navigation, routing, content metadata, visual
consistency, and regression testing increasingly difficult. The current Astro
migration establishes a stronger foundation, but temporary legacy bridges and
duplicated structures remain.

The project must finish the migration without losing published content,
breaking production routes, weakening the visual identity, exposing sensitive
material, or making routine updates harder than before.

## 4. Objectives and measurable outcomes

| Objective                      | Release measure                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Maintainable content           | Every published writeup is represented by validated collection data; no new manually duplicated card metadata.                                               |
| Reliable routing               | All canonical pages, writeups, assets, and generated Threat Brief data pass automated checks and preview/live smoke tests.                                   |
| Accessible interaction         | Target WCAG 2.2 Level AA for project-owned UI; keyboard focus, labels, contrast, reduced motion, and control states are reviewed.                            |
| Minimal client JavaScript      | Static HTML is the default; scripts are limited to interactions such as theme, search/filtering, charts, typing, and slideshows.                             |
| Safe delivery                  | Formatting, Astro diagnostics, production build, route checks, and repository security checks pass before merge.                                             |
| Controlled production          | Feature work is previewed and reviewed; only an owner-approved merge to `main` may trigger production.                                                       |
| Visual quality                 | Approved layouts show no critical clipping, overlap, horizontal overflow, unreadable text, or broken motion at 390, 768, 1280, and 1440 pixel review widths. |
| Privacy and publication safety | No credentials, private personal data, real CTF flag values, or unapproved factual claims are published.                                                     |

## 5. Scope

### 5.1 In scope

- Astro and TypeScript application architecture.
- Dashboard, writeup library, writeup detail, author, and portfolio routes.
- Typed content collections and generated writeup metadata.
- Shared navigation, footer, theme, metadata, cards, badges, and section
  components.
- ZEUS branding, publisher marks, certificate images, writeup covers, and
  responsive assets.
- Deployment-time Threat Brief aggregation with trusted source and image-host
  controls, validated output, and a safe fallback dataset.
- Search and filtering appropriate to the size of the writeup library.
- Accessibility, reduced motion, responsive behavior, SEO metadata, sitemap,
  robots policy, and safe external links.
- GitHub Actions checks, Vercel previews, production smoke tests, and rollback
  documentation.
- Archival of obsolete legacy files only after the replacement is verified.
  Archived files remain in the repository but are excluded from build and
  deployment output.

### 5.2 Out of scope unless separately approved

- A database, user accounts, authentication, comments, or community profiles.
- Paid analytics, advertising profiles, fingerprinting, session replay,
  cross-site tracking, or collection of visitor-submitted personal content.
- A new JavaScript UI framework when Astro and small browser modules are
  sufficient.
- A contact form, message storage, or external form provider. Contact remains
  limited to the existing approved email and professional-profile links.
- Request-time news aggregation or a permanent Threat Brief API after the
  static migration is complete.
- Changing hosting provider, production domain, Vercel project, repository
  visibility, branch protection, or secrets.
- Publishing private documents, credentials, real CTF flags, exploit targets,
  or personal information beyond the owner's approved public profile.
- Rewriting Git history or deploying with `vercel --prod`.

## 6. Confirmed current state

The following statements are confirmed from the repository as of 2026-11-11:

- Astro `7.4.8`, TypeScript `6.0.3`, and the Vercel adapter are installed.
- Node is constrained to `>=22.23.4` and the lockfile is the reproducible
  dependency source.
- Astro currently uses `output: "server"`, `trailingSlash: "always"`, and the
  Vercel adapter; static output is the approved target, not the current state.
- Native routes exist for the dashboard, author, portfolio, writeup index,
  writeup details, and `/api/security-brief`.
- A writeup content collection exists, but its source pattern and schema remain
  transitional and several fields are optional.
- Some writeups still depend on legacy HTML fallback rendering.
- The shared Astro component surface is still small; several UI sections and
  styles remain coupled to legacy files.
- GitHub Actions installs from the lockfile and runs formatting, Astro checks,
  a production build, route/link validation, and repository checks.
- `CONTRIBUTING.md` and parts of `AGENTS.md` still describe the pre-Astro static
  layout and must be reconciled before migration closure.

This section is a baseline, not a completion claim. Git state, CI output, and a
current preview remain the authority for any release decision.

## 7. Target architecture

```text
┌──────────────────────────────── Content ────────────────────────────────┐
│ Typed Markdown/MDX writeups │ Portfolio data │ Trusted RSS/NVD sources │
└───────────────────────┬───────────────────────────┬─────────────────────┘
                        │                           │
                        v                           v
┌──────────────────────── Astro + TypeScript Application ────────────────┐
│ Content collections + Zod │ Routes + layouts │ Reusable components     │
│ Static HTML and assets     │ Minimal scripts  │ Generated threat data   │
└───────────────────────┬───────────────────────────┬─────────────────────┘
                        │                           │ deployment-time fetch
                        v                           v
┌──────────────────────── Delivery and Runtime ──────────────────────────┐
│ GitHub PR → CI checks → Vercel preview → owner approval → main         │
│ CDN-served pages, assets, and validated Threat Brief snapshot          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Target source organization

```text
src/
├── assets/                 # Images processed by Astro when beneficial
├── components/
│   ├── layout/             # Navigation, footer, theme control
│   ├── content/            # Cards, badges, metadata, sections
│   ├── portfolio/          # Skills, timeline, credentials, slideshow
│   └── threat-brief/       # Feed presentation and controls
├── content/
│   └── writeups/           # One validated source document per writeup
├── data/                   # Typed portfolio, education, skill, and link data
├── layouts/                # Site and writeup layouts
├── lib/                    # Content queries, categories, feed validation
├── pages/                  # Canonical routes and API endpoints
└── styles/                 # Tokens, global rules, and feature styles
```

Folder names may be introduced incrementally. A move is complete only when
imports, tests, documentation, and production behavior are updated together.

## 8. Architecture principles

1. **Content is data.** Writeup and portfolio facts have one typed source of
   truth rather than being copied between cards, charts, and pages.
2. **Static deployment output.** Render pages and the validated Threat Brief
   snapshot during deployment. Browser interactions may be dynamic, but
   published news data changes only after a tested deployment.
3. **Minimal hydration.** Add browser JavaScript only to the component that
   needs interaction. Do not add React, Vue, or Svelte solely to reproduce
   behavior that a small script can provide.
4. **Progressive enhancement.** Core reading and navigation remain available
   when animation, a feed source, an image, or client JavaScript fails.
5. **Accessible by design.** Keyboard operation, visible focus, semantic
   structure, sufficient contrast, alternative text, and reduced motion are
   design requirements rather than cleanup work.
6. **Trust is visible.** Threat stories identify their publisher, date, and
   original source. Portfolio claims use owner-approved facts only.
7. **Security and privacy by default.** Validate external URLs, restrict source
   hosts, redact flags, avoid secrets in the client, and minimize third parties.
8. **One release path.** GitHub pull requests, required checks, Vercel previews,
   owner approval, and the production branch form the release process.
9. **Evidence over assumption.** A successful build is necessary but not
   sufficient; release evidence includes browser behavior and live routes.

## 9. Architecture decision record

| ID  | Decision                                                                                                                               | Status   | Rationale                                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Use Astro + TypeScript as the application framework.                                                                                   | Accepted | Matches the content-heavy site, supports server-rendered HTML, typed content, and limited client JavaScript.                                                                      |
| D2  | Move the target architecture to static Astro output; current server mode is transitional.                                              | Accepted | The owner requires Threat Brief data to update only during deployment.                                                                                                            |
| D3  | Fetch, validate, and freeze Threat Brief data during deployment; block release if every approved external source fails.                | Accepted | Production approval requires validated external stories plus generated-story and interaction testing in the preview.                                                              |
| D4  | Move every published writeup to a strict content collection.                                                                           | Target   | Current collection fields and legacy fallbacks are transitional.                                                                                                                  |
| D5  | Use Astro components and small TypeScript/JavaScript modules before adding a UI framework.                                             | Accepted | Existing interactions do not justify framework-wide hydration.                                                                                                                    |
| D6  | Centralize design tokens and shared layout components incrementally.                                                                   | Target   | Reduces duplicated styling without forcing a risky one-step rewrite.                                                                                                              |
| D7  | Keep Vercel as host and GitHub as the source and approval system.                                                                      | Accepted | Existing previews, checks, production branch, and domain already use this path.                                                                                                   |
| D8  | Move obsolete legacy implementation files into a non-deployed repository archive after verified cutover.                               | Accepted | Preserves reference and rollback material without allowing legacy files to own or override production routes.                                                                     |
| D9  | Evaluate Pagefind only when full-text search provides clear value.                                                                     | Proposed | Current filters may be sufficient; a dependency should solve a demonstrated need.                                                                                                 |
| D10 | Permit evidence-backed section redesigns while preserving the ZEUS identity.                                                           | Accepted | Clearer and more elegant results are preferred over strict visual parity when content, accessibility, and required behavior are preserved and the owner approves the preview.     |
| D11 | Use Vercel Web Analytics as the only approved analytics service, configured for aggregate measurement only.                            | Accepted | The owner wants useful traffic measurement without intensive tracking; no alternative provider or sensitive custom event is authorized.                                           |
| D12 | Keep contact as approved email and professional-profile links only.                                                                    | Accepted | No contact form, visitor-message storage, or external form provider is authorized.                                                                                                |
| D13 | Add browser security headers in code through a staged `test` rollout; begin CSP in report-only mode.                                   | Accepted | Headers must improve security without assumptions: preview tests must prove scripts, images, analytics, feeds, and motion work before CSP enforcement.                            |
| D14 | Require every AI agent to keep the owner aware of and in control of every code change through explicit scope and complete diff review. | Accepted | Prevents immediate scope drift and ensures the owner can understand, tune, reject, or stop any implementation before it is committed.                                             |
| D15 | Preserve autonomous AI implementation inside an owner-approved scope.                                                                  | Accepted | Agents may make routine internal coding decisions and complete approved work without repeated interruption, while scope, diff, commit, and release gates remain owner-controlled. |

Changes to accepted decisions require an owner-approved change record that
states the reason, alternatives, migration effect, and rollback plan.

## 10. Functional requirements

### 10.1 Content and writeups

- Every published writeup has a unique canonical slug and validated metadata.
- The collection schema requires the fields used by cards, filters, metadata,
  and route generation.
- The hub derives cards and filter values from the collection.
- Writeup bodies preserve readable code, tables, diagrams, references, and
  methodology while excluding real flag values and sensitive information.
- Unknown slugs return a deliberate 404 response.

### 10.2 Portfolio and author

- Author and portfolio routes use native Astro components rather than a legacy
  HTML bridge.
- Repeated credentials, education, experience, skills, and projects come from
  typed data modules.
- Animations, typing text, charts, and slideshows have keyboard-accessible
  controls and reduced-motion behavior.
- Official marks are used only from approved sources and retain appropriate
  attribution or link context.

### 10.3 Threat Brief

- The deployment build fetches data only from approved publisher and image
  hosts.
- One unavailable publisher does not break the build when sufficient validated
  stories or the approved fallback dataset remain available.
- If every approved external source produces zero validated stories, the build
  fails and deployment is blocked until external data is restored or the owner
  explicitly changes this policy.
- A releasable build requires at least three distinct approved publishers and
  seven validated stories. Falling below either threshold blocks deployment.
- Generated stories are validated, deduplicated, freshness-limited, and written
  as static build data.
- The UI identifies the source and links to the original article.
- Trusted fallback content may support development and partial-source failure,
  but it cannot make a zero-source production build releasable.
- Play/pause and previous/next controls remain usable by keyboard and assistive
  technology; automatic motion respects user preferences.
- Preview verification confirms story count, attribution, links,
  images/fallbacks, typing, rotation, pause, and navigation before production
  approval.

### 10.4 Navigation and compatibility

- Canonical internal links use Astro routes rather than legacy `.html` paths.
- Approved legacy public URLs redirect to the matching canonical routes.
- Theme state and primary navigation behave consistently on every route.
- No project-owned link or asset included in a production page returns 404.

## 11. Non-functional requirements

### 11.1 Accessibility

- Target WCAG 2.2 Level AA for project-owned pages and controls.
- All functionality is keyboard operable without a keyboard trap.
- Focus indicators are visible and not obscured by project-owned overlays.
- Text alternatives, headings, landmarks, labels, status text, and link purpose
  are programmatically understandable.
- `prefers-reduced-motion` disables non-essential motion without hiding content.
- Automated checks support but do not replace manual keyboard and browser
  review.

### 11.2 Performance

- Pages send no component-framework runtime unless an approved feature needs it.
- Images specify dimensions and use suitable formats and sizes.
- Production review records Lighthouse results for representative routes; the
  initial release target is at least 90 for Performance, Accessibility, Best
  Practices, and SEO, with documented reasons for any approved exception.
- External feed latency is bounded during the build and cannot delay visitor
  page rendering after deployment.

### 11.3 Security and privacy

- No secrets, credentials, private keys, `.env` files, or sensitive personal
  documents enter Git history or build output.
- Published CTF material explains methodology without publishing real flags.
- External links use safe schemes and appropriate `rel` attributes.
- Feed URLs and images are allowlisted and validated before browser exposure.
- Security headers are implemented in code and evaluated on `test` before
  production. Content Security Policy begins in report-only mode and is
  enforced only after preview evidence shows that scripts, images, analytics,
  links, feeds, and animations remain functional.
- The intended baseline includes content-type protection, referrer limits,
  anti-framing protection, and a permissions policy that disables unneeded
  browser capabilities. Values must be compatible with the deployed site and
  documented rather than copied blindly.
- Dependencies are lockfile-controlled and reviewed before addition or major
  upgrade.
- Analytics, if enabled, is limited to aggregate traffic and performance
  signals. It must not use advertising identifiers, session replay,
  fingerprinting, cross-site profiles, or custom events containing personal or
  sensitive information.

### 11.4 Reliability and maintainability

- A clean checkout on the documented Node version can install and build from
  the lockfile.
- Generated output, caches, and local environment files are not committed.
- Formatting, type/content checks, build, link/route validation, and repository
  policy checks are deterministic in CI.
- Shared behavior has one implementation and focused tests or browser evidence.

## 12. Delivery and governance

### 12.1 Roles and authority

| Role           | Authority                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Project owner  | Defines product direction, approves factual content, scope changes, release, and production merge.           |
| Codex          | Technical integrator; implements assigned work, verifies the complete result, and prepares release evidence. |
| Claude/ChatGPT | Co-leads within owner-assigned scope; may design, implement, or review without overriding owner authority.   |
| AGY            | Optional read-only adviser; output is untrusted until verified by Codex.                                     |

Detailed coordination rules are archived in
`documentation/archive/ai-agent-role-manager.md`. Model and tier operational strategies are documented in `documentation/claude-role.md` and `documentation/codex-role.md`.

#### Operational model sub-roles

| # | Role Name | Purpose | Claude Model Tier | Codex Model Tier |
|---|---|---|---|---|
| **1** | **Head-Dev / Architect** | High-level system design, schema/API contracts, diff review, breaking vague goals into specs. *(Use sparingly, planning only)* | **Claude Opus** (High/Max thinking) | **GPT-6 Astra** (High/Max thinking) |
| **2** | **Technical Implementation** | Core coding workhorse (~80% of sessions): writing Astro components, routing, tests, refactoring. | **Claude Sonnet** (Default workhorse) | **GPT-6.1 Sol** (Default workhorse) |
| **3** | **Bug Investigator** | Root-causing 500s, build/deploy failures, logic bugs. Start on workhorse; escalate to Flagship *only* after 2 failed attempts. | **Claude Sonnet** ➔ escalate to **Opus** | **GPT-6.1 Sol** ➔ escalate to **Astra** |
| **4** | **Visual / CSS Debugger** | Inspecting screenshots, UI layout breaks, responsive quirks, CSS specificity conflicts. | **Claude Sonnet** (Handles vision + code natively) | **GPT-6.1 Terra** (Diagnoses screenshot, hands fix to Sol) |
| **5** | **Bulk / Boilerplate** | Zero-reasoning tasks: commit messages, README edits, basic config updates, boilerplate stubs. | **Claude Haiku** (Protect Pro quota) | **GPT-6 Luna** (Protect Pro quota) |

### 12.2 Branch and release flow

```text
Owner-approved work
        ↓
Dedicated feat/* or fix/* branch
        ↓
Local checks and focused review
        ↓
Pull request into `test` and Vercel staging preview
        ↓
GitHub required checks + browser acceptance evidence
        ↓
Owner verifies the result and confirms satisfaction
        ↓
Merge feature into `test`
        ↓
Promotion pull request from `test` to `main`
        ↓
Owner explicitly approves production promotion
        ↓
Merge `test` into production branch (`main`)
        ↓
Automatic Vercel deployment + live smoke test
```

- No agent pushes directly to `main`.
- Every feature or fix must be integrated and verified on `test` before it is
  eligible for promotion to `main`.
- Passing automation is not owner acceptance. The staging preview and evidence
  must demonstrate the requested outcome to the owner's satisfaction.
- Before editing code, every AI agent must state the objective, exact files expected to
  change, intended behavior, tests, and explicit out-of-scope boundaries, then
  wait for owner approval.
- After scope approval, the assigned agent implements and tests autonomously
  within the approved boundaries without requesting approval for each routine
  internal coding choice.
- Code changes must be small enough for meaningful review. After editing and
  testing, the implementing agent must present the complete diff and explain material lines,
  assumptions, and test evidence. The owner may tune, reject, or stop the work.
- No AI agent may commit code until the owner approves the reviewed diff. A new
  file, behavior, dependency, or affected area outside the approved scope
  requires a new notification and approval before editing continues.
- Codex may redesign individual sections when the change preserves the ZEUS
  identity, approved content, accessibility, and required behavior. Material
  visual changes must be demonstrated in a preview for owner approval.
- Every push, pull request, merge, deployment, dependency addition, and change
  to `main` requires separate explicit owner approval.
- No production release is inferred from a request to edit, test, or preview.
- No manual `vercel --prod` deployment is part of the standard workflow.
- Rollback uses the previous known-good Vercel deployment and a Git revert
  through the normal review path.

### 12.3 Required change record

Material pull requests record:

- owner-approved scope and file list;
- explicit out-of-scope boundaries;
- objective and charter/plan reference;
- files and behavior changed;
- implementer and reviewer;
- commands and checks run;
- preview URL, routes, viewports, and interactions tested;
- accessibility and security observations;
- known limitations, migration effects, and rollback method.

## 13. Quality gates and release acceptance

A production candidate is acceptable only when all applicable evidence exists:

| Gate             | Required evidence                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope            | Change maps to this charter and an approved plan item.                                                                                     |
| Repository       | Working tree and diff contain only intended files; user-owned files are preserved.                                                         |
| Install          | `npm ci` succeeds using the documented Node version.                                                                                       |
| Format           | `npm run format:check` passes.                                                                                                             |
| Type/content     | `npm run check` passes with no errors.                                                                                                     |
| Build            | `npm run build` completes successfully.                                                                                                    |
| Routes           | `npm run check:routes` and repository checks pass.                                                                                         |
| Runtime          | Canonical pages, representative writeups, assets, and redirects return expected responses.                                                 |
| Threat Brief     | Generated deployment data contains at least 3 distinct approved publishers and 7 validated stories.                                        |
| Interaction      | Theme, navigation, filters/search, typing, slideshow, charts, anchors, and motion behavior are exercised where present.                    |
| Responsive       | Representative pages are reviewed at approximately 390, 768, 1280, and 1440 pixels.                                                        |
| Accessibility    | Keyboard path, focus visibility, names/labels, reduced motion, contrast, and content visibility are reviewed.                              |
| Security/privacy | No credentials, flags, unsafe external data, or unapproved personal claims are introduced.                                                 |
| Release          | Required checks pass on `test`, staging evidence satisfies the owner, and the owner separately authorizes promotion from `test` to `main`. |

## 14. Milestones

The authoritative task detail remains in `MIGRATION_PLAN.md`. Charter-level
milestones are:

1. **Foundation stabilization** — reproducible Astro/Vercel build and routing.
2. **Architecture organization** — shared components, styles, assets, and typed
   data boundaries.
3. **Content completion** — strict collection-backed writeups with no deploy
   dependency on legacy pages.
4. **Portfolio completion** — native, responsive, accessible author and
   portfolio experiences.
5. **Quality completion** — automated gates plus recorded browser,
   accessibility, security, and performance evidence.
6. **Controlled cleanup** — compatibility redirects, documentation alignment,
   non-deployed legacy archival, and rollback verification.

No percentage alone establishes milestone completion; the corresponding
acceptance evidence does.

## 15. Risk register

| Risk                                                         | Impact | Mitigation and release response                                                                                                                                                     |
| ------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy files override Astro routes                           | High   | Assign one owner per public route; test generated Vercel routing and legacy redirects before release.                                                                               |
| Visual parity regresses during componentization              | High   | Migrate incrementally; compare approved desktop/mobile views and interactions before removing references.                                                                           |
| Deployment-time feeds are slow, unavailable, or unsafe       | High   | Allowlist hosts, validate output, enforce build timeouts, isolate partial failures, inspect generated preview data, and block deployment when every approved external source fails. |
| Optional collection metadata permits inconsistent content    | Medium | Make production-required fields mandatory and validate conditional rules before completing content migration.                                                                       |
| Multiple agents create overlapping edits                     | High   | Use explicit file ownership, Git status/diff handoffs, and one technical integrator.                                                                                                |
| Documentation describes legacy architecture                  | Medium | Update charter, plan, architecture, agent rules, and contribution guide in the same cleanup milestone.                                                                              |
| Motion reduces usability or fails on some browsers           | Medium | Progressive enhancement, reduced-motion support, visible static fallback, and real-browser review.                                                                                  |
| Production is merged before complete evidence                | High   | Required checks, preview review, owner-only release authority, and no manual production deploys.                                                                                    |
| Third-party dependency increases maintenance or privacy cost | Medium | Require a demonstrated need, owner approval, source review, lockfile change, and rollback plan.                                                                                     |

## 16. Assumptions, constraints, and open decisions

### 16.1 Assumptions to verify during implementation

- Vercel remains connected to `Botrasky/dvb` with `main` as the production
  branch.
- The public domain and trusted feed publishers remain approved by the owner.
- Current public portfolio facts and assets remain authorized for publication.

### 16.2 Open decisions

1. Final strict writeup schema, including conditional fields by content type.
2. Whether Pagefind is justified after collection-native filtering is complete.
3. Final enforced CSP directives after report-only preview evidence.
4. Whether sitemap generation uses Astro's integration or a reviewed custom
   process.
5. The measured Lighthouse baseline and any explicitly approved exceptions.

Open decisions must not be silently resolved by an agent or dependency default.

## 17. Research basis

This charter uses official, primary references and repository evidence. Links
were checked on 2026-11-11:

- [Astro: Islands architecture](https://docs.astro.build/en/concepts/islands/)
  — server-rendered HTML with explicit hydration for interactive components.
- [Astro: Content collections](https://docs.astro.build/en/guides/content-collections/)
  — loaders, schemas, and typed content APIs.
- [Astro: On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
  — reviewed as an alternative; request-time rendering is not the approved
  Threat Brief target.
- [Astro: Images](https://docs.astro.build/en/guides/images/) — current image
  components and asset guidance; supersedes older `@astrojs/image` advice.
- [Vercel: Astro](https://vercel.com/docs/frameworks/frontend/astro) — Astro
  adapter and static/server deployment support.
- [Vercel: Git deployments](https://vercel.com/docs/git) — preview deployments
  from branch/PR work and production deployments from the configured production
  branch.
- [Vercel: Web Analytics](https://vercel.com/docs/analytics) — candidate
  cookie-free aggregate analytics; enabling it still requires explicit owner
  approval and privacy verification.
- [GitHub: Protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
  — required reviews, status checks, deployment requirements, and push rules.
- [W3C: WCAG 2.2](https://www.w3.org/TR/wcag/) — current accessibility success
  criteria used as the project target.
- [Pagefind](https://pagefind.app/) — candidate static search system, retained as
  an option rather than an approved dependency.

## 18. Approval

This charter becomes the project baseline when the owner approves it. Approval
does not authorize a production merge, dependency addition, repository-setting
change, or deployment. Those actions retain their existing explicit approval
requirements.

| Decision                                | Owner              | Date       |
| --------------------------------------- | ------------------ | ---------- |
| Charter approved                        | Vathanak Botra Dos | 2026-11-11 |
| Architecture decisions D1–D15 confirmed | Vathanak Botra Dos | 2026-11-11 |
| Open decisions delegated                | Vathanak Botra Dos | 2026-11-11 |
