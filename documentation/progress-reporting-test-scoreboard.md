# Progress Reporting Test Scoreboard

Last updated: 2026-11-13

Purpose: verify that AI agents record completed work in
`documentation/PROGRESS.md` and that CI blocks implementation changes without a
progress record.

## Scoreboard

| Test | Expected result | Actual result | Status |
| --- | --- | --- | --- |
| Separate Codex agent follows written rule | Agent updates status and records its own activity before completion | Agent corrected status but omitted its own activity entry | Failed |
| Integrator detects missing activity entry | Integrator records the omission and evidence | Omission and review evidence were added to `PROGRESS.md` | Passed |
| Governance-only change set | Check exits successfully | Exit status `0` | Passed |
| Implementation change without `PROGRESS.md` | Check blocks the change set | Exit status `1` with changed-file report | Passed |
| Script syntax | Node accepts the enforcement script | `node --check` exited `0` | Passed |
| Documentation and script formatting | Prettier accepts all affected files | Prettier exited `0` | Passed |
| Git whitespace validation | Diff contains no whitespace errors | `git diff --check` exited `0` | Passed |
| CI checkout history | Base and head commits are available to the checker | Workflow uses `fetch-depth: 0` | Passed |
| New-entry validation | Editing `PROGRESS.md` without adding an activity entry is rejected | Checker inspects added diff lines for a dated entry | Passed |

## Result

Automated enforcement works for commit and pull-request change sets. Written
instructions alone were insufficient in the separate-agent test, so Codex must
continue reviewing the accuracy of each progress entry.

Current score: **8 passed, 1 failed**.

## Coverage still needed

- Test Claude against the same completion requirement.
- Test the GitHub Actions check on a pull request.
- Confirm AGY findings are recorded by Codex or Claude because AGY is read-only.
- Confirm an implementation pull request containing a valid progress update
  passes the hosted CI check.

## Files under test

- `AGENTS.md`
- `documentation/PROJECT_CHARTER.md`
- `documentation/codex-role.md`
- `documentation/claude-role.md`
- `documentation/PROGRESS.md`
- `scripts/check-progress-record.mjs`
- `.github/workflows/ci.yml`
