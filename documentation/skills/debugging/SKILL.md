# Debugging Skill

**Purpose:** Diagnose and resolve build failures, runtime errors, visual regressions, and unexpected behavior in the ZEUS portfolio.

**When to use:** When a check fails, a build breaks, a route returns an error, or the visual output does not match expectations.

**Scope:** Investigation and targeted fixes within the approved file scope. If the fix requires out-of-scope changes, stop and report.

## Triggers

- `npm run check` reports errors or warnings.
- `npm run build` fails.
- `npm run check:routes` reports missing pages or broken assets.
- A preview shows visual regressions (clipping, overflow, broken layout, unreadable text).
- A `polish.css` 404 or similar asset-loading failure on nested routes.
- Light/dark mode inconsistencies.

## Procedure

### 1. Reproduce the problem

- Run the failing command and capture the full output.
- Note the exact error message, file, and line number.
- Check `git status` and `git diff` to identify recent changes that might have caused the issue.

### 2. Astro/TypeScript errors

- **Type errors:** Check component prop interfaces, content collection schemas, and Zod validation.
- **Import errors:** Verify relative paths and existing aliases. Astro source lives in `src/`; follow the imports used by nearby files.
- **Build errors:** Check `astro.config.mjs` for adapter, output mode, and trailing slash settings.
- **Content collection errors:** Validate that all required schema fields are present in content files.

### 3. CSS/UI issues

- **404s on nested routes:** Check whether asset paths resolve correctly from nested routes; follow the existing public asset path convention.
- **Mirror desync:** If both `css/` and `public/css/` contain a copy, compare them. Update the published copy only when the change scope permits it.
- **Light-mode contrast:** Check high-specificity selectors. Light-mode overrides may need `html.light-mode body.<page-class>` specificity to override dark-mode defaults.
- **Glassmorphism fallback:** Verify that `@supports` blocks have solid-color fallbacks for browsers without `backdrop-filter`.
- **Responsive breakage:** Test at 390, 768, 1280, and 1440 px. Check for horizontal overflow, clipped text, or overlapping elements.

### 4. Route and asset errors

- **Missing routes:** Verify the page file exists under `src/pages/` with the expected directory structure.
- **Asset 404s:** Check that assets exist under `public/` and that references use the convention for the relevant Astro or legacy page.
- **Favicon issues:** Confirm `<link rel="icon">` points to an existing public asset.

### 5. Apply the fix

- Make the minimal change needed to resolve the issue.
- Stay within the approved file scope.
- Run the full verification suite after the fix.

## Verification

```bash
npm run check               # Must pass after fix
npm run build               # Must complete successfully
npm run check:routes        # All routes valid
git diff --check            # No whitespace issues introduced
```

For visual issues, use Playwright or manual browser preview to confirm the fix at the affected breakpoints and theme modes.

## Boundaries

- Fix only the identified issue. Do not refactor unrelated code.
- If the root cause is outside the approved scope, report it and stop.
- Do not commit, push, merge, or deploy the fix without owner approval.

## Handoff

Record the issue, root cause, fix applied, and verification results in `documentation/PROGRESS.md`.
