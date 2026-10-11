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

**Deploys are automatic. Do not deploy by hand.**

The Vercel project `portfolio` is connected to this repository under the same GitHub identity
that owns it. Merging a pull request into `main` builds and publishes
https://vathanakbotra.vercel.app on its own, usually within seconds. Pull requests get their own
preview deployment, linked from the "Vercel" check on the PR.

So the whole release flow is just the pipeline above: PR into `test`, PR into `main`, merge. There
is no separate deploy step for anyone to run.

**Where production lives — read this before touching Vercel**

| | |
| --- | --- |
| Repository | `Botrasky/dvb` |
| Vercel project | **`dvb-og72`** |
| Live URL | https://vathanakbotra.vercel.app |

The production project is called **`dvb-og72`**. The name is historical and tells you nothing, but
it is the real one: it is connected to this repository, it owns the live domain, and it is what
deploys when `main` moves. **There is no project named `portfolio`.** A cryptic name is not
evidence of a leftover — don't go looking for a "better named" project and don't deploy to one.

Two things that look broken but are not:

- `dvb-og72.vercel.app` (the project's own default subdomain) returns 404. Harmless. The custom
  domain above is what serves the site.
- Pull requests show a single "Vercel" check pointing at `dvb-og72`. One check is correct.

**The repository and the Vercel account are the same identity** (GitHub `Botrasky`), and that is
the whole point. Production previously sat in a second, unconnected Vercel account, so merging to
`main` deployed nothing and manual deploys failed as `Blocked` — a long and avoidable mess. If you
find a reference anywhere to a different Vercel account, or to a project named `portfolio-2026`,
it is stale: ask the owner instead of acting on it.

**After merging to `main`, verify the live site** rather than assuming:

```
curl -s -o /dev/null -w '%{http_code}\n' https://vathanakbotra.vercel.app/
curl -s -o /dev/null -w '%{http_code}\n' https://vathanakbotra.vercel.app/writeups/<slug>/
```

Both should return `200`. If a new page 404s, the deployment has not finished or has failed —
check the project's Deployments tab before changing anything.

**Do not run `vercel --prod`.** A manual CLI deploy from this folder is both unnecessary and
unreliable: Vercel attributes a CLI deploy to the HEAD commit's author, and after a GitHub merge
that author is a `…@users.noreply.github.com` address, which can leave the deployment stuck in
status `Blocked` instead of building. Let the Git integration deploy.

If you ever do need to debug a deployment, `vercel inspect <deployment-url>` prints a `reason`
field. A `Blocked` deployment is terminal — waiting will never make it finish. Use Vercel CLI 63
or newer; older versions display `Blocked` as `UNKNOWN`, which hides the reason entirely.

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
- ~~**One Vercel account.**~~ Closed. The site previously lived in a second Vercel account that was
  not connected to this repo, so merging to `main` never deployed and production had to be pushed
  by hand. Production now runs from the `portfolio` project under the same account as the
  repository, previews and production sit together, and merging to `main` deploys automatically.

## Rollback

If the live site is broken: redeploy the previous production deployment from the Vercel dashboard (Deployments → previous → Promote), then revert the bad commit on `main` through a pull request.
