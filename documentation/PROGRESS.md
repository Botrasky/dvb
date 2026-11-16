# ZEUS Project Ledger

Last updated: 2026-11-16

This file records the current work ledger, verified evidence, decisions, and timeline for the ZEUS phishing scanner.

## Current state

| Area | Status | Evidence |
| --- | --- | --- |
| Active branch | feat/phishing-scanner-v1-core | Scanner Phase 1 work is in the review checkout |
| Phase | Phase 1 complete locally | PSL parser, raw hostname preservation, mixed-script analysis, and tests are present |
| Scanner score | Partial results only | score remains null while suspicious-character coverage is unavailable |
| Verification | Passed | 23 scanner tests, Astro checks, formatting, build, route, and repository checks |
| Commit and push | Pending owner review | Phase 1 changes are present locally and await review |
| Merge and deployment | Not authorized | Requires separate owner approval |

## Work ledger

| Item | State | Evidence or next action |
| --- | --- | --- |
| Replace injected fake domain parsing with the PSL parser | Complete | pslDomainParser is the default in scanUrl |
| Preserve the original hostname before URL normalization | Complete | ParsedInput.rawHostname is covered by tests |
| Add mixed-script analysis | Complete for Phase 1 | Analysis is non-scoring and does not complete Unicode coverage |
| Keep partial scores as null | Complete | Covered by scanner tests and default-parser integration test |
| Add parser and script-analysis regression tests | Complete | 23 scanner tests pass |
| Validate the final Phase 1 diff | Complete | Formatting, Astro checks, build, route, and repository checks pass |
| Review and approve the Phase 1 diff | Pending owner | Review the working-tree diff |
| Commit Phase 1 | Pending owner | Commit only after diff approval |
| Push Phase 1 | Pending owner | Push only after separate push approval |
| Complete UTS#39/confusable coverage | Future | Requires a separate approved phase |
| Calibrate scoring and reviewed brand data | Future | Requires labeled examples and owner approval |
| Enable feature-branch CI triggers | Complete | Commit 0708b01 runs checks on every branch push |
| Document the scoring contract | Complete | frontend/src/lib/scanner/README.md records partial-score and calibration rules |

## Verified evidence

| Check | Result | Notes |
| --- | --- | --- |
| npm run test:scanner | Passed | 23 scanner tests |
| npm run format:check | Passed | All files match Prettier style |
| npm run check | Passed | 0 diagnostics |
| npm run build | Passed | Vercel adapter build completed |
| npm run check:routes | Passed | 18 HTML pages validated |
| bash scripts/ci-check.sh | Passed | Repository security and link checks passed |
| git diff HEAD --check | Passed | No whitespace errors |

## Timeline

| Date | Event | Result |
| --- | --- | --- |
| 2026-11-15 | ZEUS scanner prototype prepared | Browser-only parser, redaction, rule validation, typed results, and 11 tests |
| 2026-11-16 | PSL parser integrated | Registrable-domain parsing uses the maintained psl dependency |
| 2026-11-16 | Hostname and script handling added | Raw hostname preservation and non-scoring mixed-script analysis |
| 2026-11-16 | Phase 1 verification completed | 23 tests and the full local quality suite passed |
| 2026-11-16 | Review state recorded | Changes remain local and await owner review before commit |
| 2026-11-16 | Feature-branch CI enabled | Commit 0708b01 runs the existing checks on every branch push |

## Decisions

| Decision | Rationale | Status | Applies to |
| --- | --- | --- | --- |
| Keep suspicious-character coverage unavailable | Reviewed Unicode and UTS#39 handling is incomplete | Active | Phase 1 |
| Withhold numeric scores when coverage is incomplete | Prevents partial analysis from presenting a definitive score | Active | Scanner results |
| Retain parser injection in tests | Keeps isolated engine tests deterministic | Active | Scanner tests |
| Do not fetch or follow submitted destinations | Preserves browser-only URL analysis | Active | Scanner behavior |
| Require separate approval for merge and deployment | Keeps release actions owner-controlled | Active | Repository release |
