# Scanner scoring contract

The scanner reports URL-structure findings and keeps the evidence separate from the final score.

Each finding has a category cap. Related findings are limited before contributions are totaled, so one URL signal cannot exceed its category allowance.

The numeric score is null whenever any required coverage check is unavailable or fails. The current Unicode and suspicious-character checks remain unavailable while reviewed UTS#39 confusable data is pending.

The current weights and labels are provisional. They require a reviewed corpus of legitimate and phishing examples before a numeric score can be treated as calibrated. A score is a heuristic observation of URL structure and does not establish that a destination is safe.

The engine version, scoring version, rules version, coverage, findings, and limitations are returned together so reports can preserve the conditions under which a result was produced.
