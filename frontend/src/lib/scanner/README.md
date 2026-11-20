# Scanner scoring contract

The scanner reports URL-structure findings and keeps the evidence separate from the final score.

Each finding has a category cap. Related findings are limited before contributions are totaled, so one URL signal cannot exceed its category allowance.

The numeric score is null whenever any required coverage check is unavailable or fails. The current Unicode and suspicious-character checks remain unavailable while reviewed UTS#39 confusable data is pending.

The current weights and labels are provisional. They require a reviewed corpus of legitimate and phishing examples before a numeric score can be treated as calibrated. A score is a heuristic observation of URL structure and does not establish that a destination is safe.

The engine version, scoring version, rules version, coverage, findings, and limitations are returned together so reports can preserve the conditions under which a result was produced.

## Beta VirusTotal first-stage cross-check

Submitting the scanner form automatically looks up an existing VirusTotal URL
report. The URL is sent to the ZEUS server route, which
queries VirusTotal using the server-only `VIRUSTOTAL_API` environment variable.
The lookup does not submit a new scan or visit the destination. VirusTotal may
add queried URLs to its community dataset, so the page discloses this before
submission and warns against sending sensitive URLs.

The VirusTotal summary is displayed in the ZEUS result template and remains
separate from the local heuristic score. A report with zero detections says
"No known threat found," not "safe." Missing reports and provider failures
remain inconclusive. The public VirusTotal API has a low request quota; a
production edge rate limit must be configured before enabling the key on the
public deployment. Do not commit `.env`; configure `VIRUSTOTAL_API` as a
server-side environment secret.
