# Phishing Scanner Beta Plan

**Status:** VirusTotal-only beta implementation in progress on `feat/phishing-scanner-v1-core`.
**Owner:** Vathanak Botra Dos
**Implementer/reviewer:** Codex

## Objective

Let visitors submit a public URL once, see local URL-structure observations,
and receive a first-stage reputation cross-check from an existing VirusTotal
report. The beta does not crawl the destination, submit a new VirusTotal scan,
or assert that a URL is safe.

## Scope and behavior

1. Keep local URL parsing, heuristic findings, redacted reporting, keyboard
   navigation, and responsive scanner UI.
2. Show a disclosure beside Scan URL: the submitted URL goes to VirusTotal;
   visitors must not submit sensitive or private URLs. The server holds the
   `VIRUSTOTAL_API` key and never returns it to the browser.
3. The same-origin Astro POST route validates JSON, body size, origin, URL
   scheme, embedded credentials, and sensitive parameter names. It calls only
   the fixed VirusTotal existing-report endpoint. It returns allowlisted
   evidence; no raw provider response, submitted URL, or secret.
4. Show one ZEUS beta verdict based on VirusTotal evidence:
   - **Known threat:** at least three malicious engine detections.
   - **Suspicious:** one or two malicious detections, or any suspicious detection.
   - **No known threat found:** an existing report with analyzed engines and
     zero malicious and suspicious detections. State that this does not prove safety.
   - **Inconclusive:** no report, no analyzed engines, or provider unavailable.
5. Show the report date and engine counts so visitors can judge evidence age.
   The local structural score remains separate from the reputation verdict.
6. Label the feature **Beta** and the provider result a **first-stage cross-check**.
   Google Safe Browsing is out of scope for this beta.

## Files in this change

- `backend/phishing-check.mjs`, `backend/reputation-verdict.mjs`, `backend/virustotal.mjs`
- `frontend/src/pages/api/phishing-check.ts`, `frontend/src/pages/tools/phishing-scanner/index.astro`, `frontend/src/env.d.ts`
- `frontend/src/lib/scanner/README.md`
- `tests/scanner/virustotal.test.mjs`, `tests/scanner/reputation-verdict.test.mjs`
- `documentation/phishing-scanner-plan.md`, `documentation/PROGRESS.md`

The untracked Google helper and its test are removed from the beta change.

## Verification and release gates

- Run scanner tests, Astro check, build, route check, and scoped formatting checks.
- Exercise clean, suspicious, missing-report, and provider-error API responses.
- Review the scanner page at desktop and mobile widths, including light and dark modes.
- Confirm a **newly rotated** VirusTotal key is configured as a server-side Vercel
  environment variable. The key previously pasted in chat must not be deployed.
- Protect the public API endpoint against quota exhaustion. VirusTotal's public
  quota is low, and the endpoint must not rely on per-instance memory limits.
- Review the full diff, record results in `documentation/PROGRESS.md`, then obtain
  the repository-required approvals for commit, push, PR, merge, and deployment.
- Verify the deployed beta URL and provider response after release.
