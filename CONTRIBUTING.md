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
| `writeups/` | CTF / lab writeups: `index.html` is the hub, each lab is `writeups/<slug>/index.html`. Shared `writeups.css` + `writeups.js`. |
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
- After a deploy, open the live URL and confirm the page loads.

**Merging to `main` does not deploy the live site.** The live domain
https://vathanakbotra.vercel.app is served by the Vercel project `portfolio-2026`, which is
**not** connected to this repo. The GitHub integration builds two unrelated projects (`dvb`,
`dvb-og72`) — those are the "Vercel – …" checks on pull requests, and they do not serve the
live domain. So don't poll the live URL after a merge expecting it to change; production needs
the manual deploy below.

**Requirements before deploying**

- **Vercel CLI 63 or newer** (`vercel --version`). Older versions report a blocked deployment as
  status `UNKNOWN` with `?` duration, which makes a hard failure look like a slow build and hides
  the reason. If the CLI is old, upgrade the copy that is actually on `PATH` — check
  `which vercel` against `npm root -g`, because this machine has them in different prefixes
  (`npm i -g --prefix /opt/homebrew vercel@latest`).

**Deploy from a git-free copy of `main`**

Deploying from the repo folder fails. Vercel attaches the HEAD commit's author, and after a
GitHub pull-request merge that author is a `…@users.noreply.github.com` address which is not a
permitted deployer on the project. The deployment goes to status `Blocked`
("the commit author doesn't have permission to create deployments for this project") and never
builds. Export the tree instead, so the deploy is attributed to the CLI login:

```
D=$(mktemp -d)
git archive main | tar -x -C "$D"
mkdir -p "$D/.vercel" && cp .vercel/project.json "$D/.vercel/"
cd "$D" && vercel --prod
```

This also satisfies the "clean checkout, no untracked files" rule, because `git archive` exports
only tracked content. A successful run prints `Aliased https://vathanakbotra.vercel.app` and
`Ready` in a few seconds.

**Verify the deploy, don't watch the spinner**

```
vercel inspect <deployment-url>
curl -s -o /dev/null -w '%{http_code}\n' https://vathanakbotra.vercel.app/<new-page>/
```

`vercel inspect` prints a `reason` field explaining a `Blocked` or failed deployment. A `Blocked`
deployment is terminal — waiting will never make it finish.

## Adding a writeup (how this scales)

Each writeup is one self-contained static page; adding one is copy, edit, link.

1. **Copy an existing page** as the template: `cp -r writeups/ven-rsa writeups/<slug>` (use a short kebab-case slug). Keep the `../../` asset paths — every lab page sits exactly one level under `writeups/`.
2. **Write the content** in that page: badges (category + difficulty), the meta line, the "at a glance" panel, and the body (Summary → Recon → the flaw → Exploit → Takeaways). Reuse the existing classes (`wu-code`, `wu-details`, `wu-insight`). **Redact the flag** — use the `wu-flag-redacted` chip, never the value.
3. **Add a hub card** in `writeups/index.html`: copy a `.wu-card` block, set its `href`, `data-category` (`crypto|pwn|web|re|general|misc`), badges and hook. The filter/search needs no other change.
4. **Update the skills measurement** in `js/charts.js`: add the lab to `SOLVED_LABS` with its difficulty and the skills it exercised. The radar recomputes automatically; mirror any visible change in the homepage proficiency bars.
5. **Check and ship**: `bash scripts/ci-check.sh`, then the normal pipeline (branch → PR into `test` → PR into `main`).

Conventions to keep as this grows:
- **Categories & colours** are fixed in `writeups.css` (`cat-crypto` magenta, `cat-pwn` cyan, `cat-web` green, `cat-re` yellow, `cat-general` purple, `cat-misc` light-cyan). Reuse them; don't invent per-lab colours.
- **Difficulty** is `Easy | Medium | Hard`, matching the challenge source.
- **No build step.** If the page count ever makes the repeated nav/footer markup painful, prefer a small generator script (see how the first batch was made) over adding a bundler — the "plain static files" rule is what the CI policy is built around.
- Source labels read **CyLab**; leave literal command URLs (e.g. `picoctf.net`) untouched — they are the real hosts.

## Known gaps to close as the project scales

- **Protect `test`.** Only `main` requires a passing `checks` run, so a red commit can still land on `test`. Add the same branch protection to `test` (require `checks`) so staging stays green.
- **One Vercel account.** The live domain is served from one Vercel account while the repo auto-builds `dvb` / `dvb-og72` on another; consolidate so previews and production live together and merging to `main` can deploy automatically.

## Rollback

If the live site is broken: redeploy the previous production deployment from the Vercel dashboard (Deployments → previous → Promote), then revert the bad commit on `main` through a pull request.
