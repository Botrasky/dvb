# CI/CD policy

This applies to everyone who changes this repo: the owner (@Botrasky), Claude Code, and any other AI agent or person. AI agents must also follow [AGENTS.md](AGENTS.md).

## Layout

The site is plain static files with no build step.

| Path | Contents |
| --- | --- |
| `index.html` | Page markup only. |
| `css/` | Styles, one file per area. They are loaded in the order listed in `index.html`, and that order matters. |
| `js/` | Scripts, one file per feature, also loaded in the order listed in `index.html`. |
| `assets/certificates/` | Certificate images used by the slideshow. |
| `scripts/ci-check.sh` | The checks CI runs. |

## Branches

| Branch | Purpose | Who may push directly |
| --- | --- | --- |
| `main` | Production. What is on `main` is what is live at https://vathanakbotra.vercel.app | Nobody. Changes arrive by pull request only. |
| `test` | Staging. Work is combined and reviewed here before it goes live. | The owner, and AI agents the owner is working with in that session. |
| `feat/<topic>`, `fix/<topic>` | Human work in progress. | The author. |
| `ai/<agent>/<topic>` | Work by an AI agent acting without the owner present (for example `ai/claude/update-certs`). | The agent. |

## Pipeline

1. **Branch** from `test` (or work on `test` directly for small changes).
2. **Check locally**: `bash scripts/ci-check.sh` must pass before pushing.
3. **Push**. GitHub Actions runs the same checks on every push to `main` or `test` and on every pull request.
4. **Pull request into `test`**, or into `main` from `test` when it is ready to go live.
5. **Review**. Only the owner approves and merges into `main`. CI must be green.
6. **Deploy**. Production is deployed only from `main`, only after the merge. Other branches may get preview deployments; they never replace the live site.

## What CI enforces

`scripts/ci-check.sh` fails the build when:

- `index.html` is missing, empty, or has no doctype or title;
- `index.html` points to a local stylesheet, script or image that is not in the repo;
- a published page contains a CTF flag token (e.g. `academy{...}`, `cylab{...}`);
- an archive, executable, `.env` file or key file is tracked;
- any tracked file is larger than 5 MB;
- a file contains something that looks like a credential.

## Rules CI cannot check

- **No personal data.** This repo is public. No phone numbers, home addresses, ID numbers or private documents. The only contact email is the one already on the site.
- **No CTF flags.** Writeups share the method, never the flag value. Redact flags (show "captured", not the string). CI blocks `namespace{...}` flag tokens in any page.
- **No secrets, ever**, including in commit messages, PR text and CI logs. If one is committed, revoke it first, then remove it.
- **No history rewriting** on `main` or `test`: no force-push, no rebase of pushed commits.
- **Small, focused changes.** One topic per pull request, with a message that says what changed and why.
- **Never bypass a failing check.** Fix the cause or ask the owner.

## Deploying

- Production deploys are run by the owner, or by an AI agent only when the owner asks for that specific deploy.
- Deploy from a clean checkout of `main`, never from a working folder with untracked files.
- Until the Vercel GitHub integration is connected to this repo, deploys are manual (`vercel deploy --prod`). Once it is connected, merging to `main` deploys automatically and manual production deploys stop.
- After a deploy, open the live URL and confirm the page loads.

## Rollback

If the live site is broken: redeploy the previous production deployment from the Vercel dashboard (Deployments → previous → Promote), then revert the bad commit on `main` through a pull request.
