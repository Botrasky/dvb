# ZEUS Project Ledger

Last updated: 2026-11-16

This file records the current work ledger, verified evidence, decisions, and timeline for the ZEUS phishing scanner.

## Current state

| Area | Status | Evidence |
| --- | --- | --- |
| Active branch | feat/phishing-scanner-v1-core | Scanner Phase 1 work is in the canonical checkout |
| Phase | Phase 1 complete and pushed | PSL parser, raw hostname preservation, mixed-script analysis, Unicode skeleton matching, and tests are present |
| Scanner score | Partial results only | score remains null while suspicious-character coverage and calibration are incomplete |
| Verification | Local checks passed for current increment | 31 scanner tests, Astro check, formatting, build, and 19-page route check passed; browser acceptance remains pending |
| Commit and push | Complete | Phase 1 and follow-up increments are pushed to feat/phishing-scanner-v1-core |
| Phase 2 UI publication | Owner approved for feature branch | UI commit `2572f23`; clean snapshot passed dependency install, formatting, Astro check, 28 scanner tests, build, 19 routes, and repository checks. The 31-test result covers the local engine and test changes excluded from this push. |
| Merge and deployment | Not authorized | Requires separate owner approval |

## Public Beta readiness checklist

This is an evidence ledger, not a live dashboard. A criterion is checked only when its stated evidence is recorded.

| # | Criterion | Status | Evidence / remaining work |
| --- | --- | --- | --- |
| 1 | All six detection categories validated | Not verified | No evidence in this ledger that all six categories have reviewed coverage and tests. |
| 2 | Scoring and analysis coverage accurate | In progress | Partial coverage correctly withholds numeric scores; calibration and full UTS#39 coverage remain. |
| 3 | Signed rules, fallback, and key rotation tested | Not verified | No implementation or verification evidence recorded. |
| 4 | Privacy, XSS, and security header checks passed | Not verified | General repository security checks passed; these release-specific checks are not evidenced. |
| 5 | Supported browsers and Vercel preview tested | Not verified | No browser matrix or accepted preview evidence recorded. |
| 6 | Owner explicitly approves production deployment | Owner decision required | No deployment approval recorded; production release remains gated. |

**Readiness: 0/6 verified.** Phase 1 CI and local checks do not satisfy these six release criteria.

## Work ledger

| Item | State | Evidence or next action |
| --- | --- | --- |
| Replace injected fake domain parsing with the PSL parser | Complete | pslDomainParser is the default in scanUrl |
| Preserve the original hostname before URL normalization | Complete | ParsedInput.rawHostname is covered by tests |
| Add mixed-script analysis | Complete for Phase 1 | Analysis is non-scoring and does not complete Unicode coverage |
| Keep partial scores as null | Complete | Covered by scanner tests and default-parser integration test |
| Add parser and script-analysis regression tests | Complete | Scanner tests include a representative finding for each of six categories; release validation still requires a reviewed corpus |
| Validate the final Phase 1 diff | Complete | Formatting, Astro checks, build, route, and repository checks pass |
| Review and approve the Phase 1 diff | Complete | Owner authorized implementation, synchronization, commit and push |
| Commit Phase 1 | Complete | e945979, 53ad7f1, and 9f26191 |
| Push Phase 1 | Complete | Feature branch published |
| Complete UTS#39/confusable coverage | In progress | Unicode 16.0.0 skeleton matching is integrated; coverage remains unavailable pending broader calibration |
| Surface mixed-script observations for Unicode and Punycode labels | Complete for partial analysis | Zero-point finding on registrable label; coverage and score remain unavailable |
| Integrate scanner website page | In progress | Local Astro route, nav/home links, tabs, findings, privacy disclosure, demo and JSON export build successfully; dark dashboard cards, coverage progress animation, console states, responsive layout, and reduced-motion handling added; browser and visual checks pending |
| Calibrate scoring and reviewed brand data | Future | Requires labeled examples and owner approval |
| Add scoring regression coverage | Complete | Partial-score and cap invariants are covered in scoring.test.mjs |
| Enable feature-branch CI triggers | Complete | Commit 0708b01 runs checks on every branch push |
| Document the scoring contract | Complete | frontend/src/lib/scanner/README.md records partial-score and calibration rules |

## Verified evidence

| Check | Result | Notes |
| --- | --- | --- |
| npm run test:scanner | Passed | 31 scanner tests, including representative findings for all six categories and Japanese script combination regression |
| npm run format:check | Passed | All files match Prettier style |
| npm run check | Passed | 0 diagnostics |
| npm run build | Passed | Vercel adapter build completed |
| npm run check:routes | Passed | 19 HTML pages validated, including scanner route |
| bash scripts/ci-check.sh | Passed | Repository security and link checks passed |
| git diff HEAD --check | Passed | No whitespace errors |

## Timeline

Browser evidence (2026-11-16): The in-app browser loaded the local scanner. Enter submitted a synthetic example.com URL, the overview redacted its query, five of six categories showed as completed, the console identified suspicious characters as unavailable, and the score showed N/A. Right Arrow moved focus and selection from Overview to Findings. Scanner tests rerun: 31/31 passed. Chrome, Safari, Firefox, Edge, mobile, network privacy and XSS acceptance remain open. Full UTS#39 validation and scoring calibration remain open.

| Date | Event | Result |
| --- | --- | --- |
| 2026-11-15 | ZEUS scanner prototype prepared | Browser-only parser, redaction, rule validation, typed results, and 11 tests |
| 2026-11-16 | PSL parser integrated | Registrable-domain parsing uses the maintained psl dependency |
| 2026-11-16 | Hostname and script handling added | Raw hostname preservation and non-scoring mixed-script analysis |
| 2026-11-16 | Phase 1 verification completed | 28 tests and the full local quality suite passed |
| 2026-11-16 | Review state recorded | Owner-approved changes were committed and pushed to the feature branch |
| 2026-11-16 | Feature-branch CI enabled | Commit 0708b01 runs the existing checks on every branch push |
| 2026-11-16 | Scoring regression tests added | Partial-score and category-cap invariants are covered |
| 2026-11-16 | Canonical checkout synchronization corrected | Copied the previously missed typed PSL shim, IPv4 octet validation and default-parser integration test; 25 tests, Astro check, build and routes passed |
| 2026-11-16 | Unicode source acquired | Official version 16.0.0 confusables downloaded; SHA-256 95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611 |
| 2026-11-16 | Unicode brand matching integrated | 6,355 licensed Unicode 16 mappings, Punycode decoding and NFD skeleton comparison replace the small manual map; full script restrictions and scoring calibration remain pending |
| 2026-11-16 | Public Beta readiness checklist corrected | Six criteria are listed with evidence-based states; none is marked complete without supporting evidence |
| 2026-11-16 | Mixed-script detection integrated | Approved technical scope: engine, Unicode helper, scanner test, and ledger. Decodes registrable Punycode labels, reports a zero-point finding for mixed scripts, and preserves partial-score behavior; 29 scanner tests, formatting, and Astro check pass. Full UTS#39 coverage, scoring calibration, other release criteria, and owner release approval remain pending. |
| 2026-11-16 | Six-category representative regression added | Existing core test file exercises one finding per category, category caps, and partial-score behavior; 30/30 scanner tests pass. Broader reviewed corpus and calibration remain pending |
| 2026-11-16 | Japanese script false-positive guard added | Han, Hiragana, and Katakana combinations in the registrable label do not emit mixed-script findings; 31/31 scanner tests pass. Full UTS#39 validation remains pending |
| 2026-11-16 | Scanner UI route implemented locally | Astro page with local scan form, tabbed results, console, privacy disclosure, demo, redacted JSON/copy; nav and homepage links added. Astro check: 0 diagnostics; build and 19-page route check pass. Browser, visual, and privacy acceptance remain pending; no production approval inferred |
| 2026-11-16 | Scanner dark UI treatment added | Matched the provided dark reference with preview badge, analysis coverage bar, risk/privacy cards, green activity console, responsive layout, and reduced-motion support; live values still come from ScanResult. Formatting, Astro check, build, and route check pass |
| 2026-11-16 | Dashboard owner review preparation | Updated typography, spacing, tab styling, console to display actual coverage statuses, and keyboard tab navigation; removed repeated coverage display. Scanner tests 31/31, formatting, Astro check, build and 19-route check pass. Browser, responsive, keyboard, XSS and network privacy acceptance remain unverified; no commit or deployment authorized by this entry. |
| 2026-11-16 | Browser acceptance preparation | Local preview returned HTTP 200 after server startup. Browser automation is unavailable in this session; Chrome, Safari, Firefox, Edge, mobile, keyboard, network privacy and XSS acceptance are not yet verified. No commit, push, merge or deployment performed. |

## Decisions

| Decision | Rationale | Status | Applies to |
| --- | --- | --- | --- |
| Keep suspicious-character coverage unavailable | Reviewed Unicode and UTS#39 handling is incomplete | Active | Phase 1 |
| Withhold numeric scores when coverage is incomplete | Prevents partial analysis from presenting a definitive score | Active | Scanner results |
| Retain parser injection in tests | Keeps isolated engine tests deterministic | Active | Scanner tests |
| Do not fetch or follow submitted destinations | Preserves browser-only URL analysis | Active | Scanner behavior |
| Require separate approval for merge and deployment | Keeps release actions owner-controlled | Active | Repository release |
