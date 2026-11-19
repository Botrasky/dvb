# Release Skill

**Purpose:** Guide the branch workflow, PR preparation, and deployment gate verification for getting changes from a feature branch to production.

**When to use:** When implementation and testing are complete and the work is ready for commit, PR, and eventual merge to `main`.

**Scope:** Branch management, commit preparation, PR creation, and pre-merge verification. Each step (commit, push, PR, merge, deploy) requires separate owner approval.

## Triggers

- All relevant implementation checks pass.
- The owner has reviewed and approved the diff.
- The work is ready to be committed and prepared for merge.

## Procedure

### 1. Pre-commit verification

Run the relevant checks from the testing skill. Do not claim a command passed unless it was run:

```bash
npm run format:check
npm run check
npm run build
npm run check:routes
git diff --check
bash scripts/ci-check.sh
```

### 2. Stage and commit

**Wait for explicit owner approval of the diff before committing.**

- Stage only the approved files: `git add <file1> <file2> ...`.
- Verify staged changes: `git diff --cached --stat` and `git diff --cached --check`.
- Write a descriptive commit message:
  - Use a conventional prefix: `feat:`, `fix:`, `docs:`, `chore:`.
  - Summarize the change in the first line (≤72 characters).
  - List material changes in the body.
  - Attribute AI contributions (e.g., a `Co-authored-by` trailer).

### 3. Push

**Wait for explicit owner approval before pushing.**

- Push only the approved feature branch; use an explicit remote ref when tracking is ambiguous.
- Never push directly to `main`.
- Never force-push or rewrite pushed history.

### 4. Pull request

**Wait for explicit owner approval before creating or merging a PR.**

- Open a PR from the feature branch into `test` (staging).
- In the PR description:
  - List what changed and why.
  - Name the implementing agent and reviewer.
  - Include exact verification commands and results.
  - Note anything uncertain or incomplete.
- After staging review, promote only intended changes to `main`. Inspect the `test` versus `main` diff before opening a PR; do not include unrelated staging changes.
- Follow any repository PR template exactly, if one exists.

### 5. Pre-merge gates

The assigned integrator must verify these gates before a PR is approved:

| Gate | Required evidence |
| --- | --- |
| Scope | Changes match the approved plan |
| Implementation | Only intended files changed |
| Static checks | Formatting, type, link, and repository checks pass |
| Build | Production build completes successfully |
| Runtime | Preview routes and key interactions work |
| Security | No credentials, flags, unsafe links, or untrusted inputs |
| Review | Integration review complete |
| Release | PR and deployment path are ready |

### 6. Merge and deploy

**Only the owner approves and merges into `main`.**

- Merging to `main` triggers the configured production deployment.
- Do not run `vercel --prod` manually.
- After merge, verify the live site using the current production domain documented in the repository.

### 7. Post-deploy verification

- Confirm all expected routes return 200.
- Spot-check visual appearance in both theme modes.
- If the live site is broken, follow the owner-approved rollback process in the current contribution guidance.

## Verification

Every applicable gate in the table above must have documented evidence before merge approval.

## Boundaries

- Each action (commit, push, PR creation, PR merge, deployment) requires **separate** owner approval.
- Never push to `main`, force-push, or rewrite history.
- Never deploy manually with `vercel --prod`.
- Never change the Vercel project or domain settings, or branch protection, without explicit approval.
- AGY may not commit, push, open a PR, merge, or deploy; these restrictions are unconditional.

## Handoff

Update `documentation/PROGRESS.md` with the branch name, commit hash, PR link when created, merge status, and deployment verification results.
