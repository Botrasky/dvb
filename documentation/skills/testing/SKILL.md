# Testing Skill

**Purpose:** Run automated checks, verify routes, validate content, and confirm visual output before code is committed or handed off.

**When to use:** After implementation, before requesting commit approval. Also after debugging fixes and before release preparation.

**Scope:** Running verification commands, inspecting build output, and confirming visual behavior. No production code changes during testing unless a fix is separately approved.

## Procedure

### 1. Confirm the branch and available checks

- Read the current `package.json` scripts and contribution guidance.
- Confirm the active site source root and paths before running or interpreting route and asset checks.
- Do not assume another branch's CI setup or route count.

### 2. Static checks

Run each relevant command and report the **observed** exit code and output. Do not claim success without running the command.

```bash
npm run format:check         # Prettier formatting
npm run check                # Astro/TypeScript diagnostics
git diff --check             # Whitespace and merge-marker check
```

### 3. Build verification

```bash
npm run build                # Production build must complete
npm run check:routes         # All expected routes and assets present
```

Verify the build output and route-check report against the routes expected for the current branch. Do not rely on a fixed route count.

### 4. Repository integrity

```bash
bash scripts/ci-check.sh     # CI security and integrity checks, when present/applicable
```

This script may check for missing or malformed entry pages, broken local asset references, CTF flag tokens, tracked archives/executables/`.env` files, oversized files, and credential patterns. Confirm the current script before relying on its exact checks.

If a check reports a possible secret or flag, do not copy the sensitive value into a report. Refer to the file and redact the value.

### 5. CSS mirror sync

When matching source and published stylesheets exist, compare the actual files. Current layouts place these under `frontend/css/` and `frontend/public/css/` on `main`, and under `css/` and `public/css/` on the current flattened Astro `test` branch. Verify the current tree first.

### 6. Visual verification

For CSS, layout, or component changes, verify the visual output:

- **Review widths:** 390, 768, 1280, and 1440 px.
- **Theme modes:** Both dark mode (default) and light mode.
- **Key checks:** No horizontal overflow, no clipped text, no overlapping elements, no unreadable contrast, no broken images or icons.
- **Playwright:** Use Playwright scripts for automated visual checks when available. Capture computed styles for critical elements (nav links, theme toggle, cards, panels).
- **Manual preview:** Use `npm run dev` for a local preview.

### 7. Content validation

For writeup or content collection changes:

- Verify all required schema fields are populated.
- Confirm CTF flags are redacted.
- Check that images and assets referenced in content exist in the active branch's expected locations.
- Verify that writeup routes render correctly in the preview.

## Verification

Run the checks relevant to the approved changes. Report each command run and its observed result; explain any check not run or not applicable.

| Check | Command | Expected |
| --- | --- | --- |
| Formatting | `npm run format:check` | Exit 0 |
| Astro diagnostics | `npm run check` | No errors |
| Build | `npm run build` | Successful completion |
| Routes | `npm run check:routes` | All pages and assets valid |
| Whitespace | `git diff --check` | No issues |
| Repository integrity | `bash scripts/ci-check.sh` when present | Exit 0 |

Report only commands actually run and their observed results. If a command is not applicable to the current changes, state that explicitly rather than omitting it.

## Boundaries

- Testing does not authorize code changes. If a test reveals an issue, report it and request fix approval.
- Do not commit, push, merge, or deploy as part of testing.
- Do not install new dependencies unless a validation command fails because packages are absent, and report that situation rather than silently installing.

## Handoff

Record all test commands run, their exit codes, and any failures in `documentation/PROGRESS.md`. Include the full output of any failing check.
