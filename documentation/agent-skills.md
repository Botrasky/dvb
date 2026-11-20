# Agent Skill Index

This document indexes repository-wide skills for every AI agent working on the ZEUS Cybersecurity Portfolio.

Skills are shared repository guidance, not platform configuration. They are not automatically loaded by every AI platform; agents should read the relevant skill before beginning a task phase.

## Branch-aware repository layout

Repository layout differs across active branches. Always inspect the current branch, `package.json`, `astro.config.mjs`, and the tree before using a path from a skill:

- On current `main`, Astro source, styles, assets, and writeups are under `frontend/` (for example `frontend/src/`, `frontend/css/`, `frontend/public/`, and `frontend/writeups/`). Confirm the checked-out tree before using paths.
- `documentation/archive/` contains historical migration plans; use the current code, `documentation/architecture.md`, and `documentation/PROGRESS.md` for active state.

These are observed branch layouts, not guarantees for every future branch. Use the actual checked-out tree and active configuration as the source of truth; do not move files or infer paths from another branch.

## Skill inventory

| Skill | Path | Purpose | When to use |
| --- | --- | --- | --- |
| Shared | `documentation/skills/shared/SKILL.md` | Common rules, context, verification, and handoffs | Every task |
| Planning | `documentation/skills/planning/SKILL.md` | Scope, design, migration planning, and decomposition | Before implementation |
| Implementation | `documentation/skills/implementation/SKILL.md` | Astro, TypeScript, content, UI, API, and asset work | Approved implementation tasks |
| Debugging | `documentation/skills/debugging/SKILL.md` | Root-causing build, route, API, and visual failures | When behavior or checks fail |
| Review | `documentation/skills/review/SKILL.md` | Code, security, accessibility, and documentation review | Before handoff or release |
| Testing | `documentation/skills/testing/SKILL.md` | Formatting, type, build, route, and browser validation | After changes |
| Release | `documentation/skills/release/SKILL.md` | Branch, diff, PR, preview, and release gates | When preparing a release |
| Audit | `documentation/skills/audit/SKILL.md` | Read-only gap analysis and evidence-based reports | Broad review tasks |

## Subskills by area

The skills cover these repository-specific subskills:

- **Astro/TypeScript:** Source layouts and routes vary by branch; check the current app tree before changing components, content configuration, or pages.
- **CSS/UI:** Preserve the matching source and published CSS copies where both exist; their paths vary by branch.
- **Content:** Use the active content model and directories configured on the current branch.
- **APIs:** Security Brief routes, trusted RSS/NVD sources, and failure handling based on existing code.
- **Security & privacy:** Flag redaction, credential handling, safe external links, personal-data protection, and repository checks.
- **Accessibility:** Semantic structure, keyboard focus, labels, contrast, and reduced-motion behavior; do not claim a conformance level without evidence.
- **Browser checks:** Preview-based visual and interaction checks at relevant viewport sizes and theme modes.
- **CI:** `npm run format:check`, `npm run check`, `npm run build`, `npm run check:routes`, `git diff --check`, and `bash scripts/ci-check.sh` when applicable in the current branch.
- **Branch workflow:** Feature branches from `test`, PRs into `test` then `main`, no force-push, no direct main pushes.
- **Release gates:** Scope → implementation → static checks → build → runtime → security → review → release.

## How to use

1. Identify the current task phase (planning, implementation, debugging, etc.).
2. Read the corresponding skill file and the shared skill.
3. Confirm repository paths and commands against the current branch before applying examples.
4. Follow the procedure, verify against the relevant checks, and respect the boundaries.
5. Record completed work and observed verification in `documentation/PROGRESS.md`.

## Governance

Skills are documentation, not authorization. They do not grant permission to edit files, commit, push, merge, or deploy. Those actions follow the Universal Owner-Control Protocol in `AGENTS.md` and the workflow in `documentation/ai-agent-role-manager.md`.
