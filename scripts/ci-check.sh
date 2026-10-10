#!/usr/bin/env bash
# Repo checks. Run locally before pushing (bash scripts/ci-check.sh);
# GitHub Actions runs the same script on every push and pull request.
set -u
cd "$(git rev-parse --show-toplevel)" || exit 1

fail=0
err() { echo "FAIL: $*"; fail=1; }
ok() { echo "ok:   $*"; }

# 1. The site entry point exists and looks like a real page.
if [ ! -s index.html ]; then
  err "index.html is missing or empty"
elif ! head -c 2000 index.html | grep -qi '<!doctype html'; then
  err "index.html does not start with <!DOCTYPE html>"
elif ! grep -qi '<title>[^<]\{1,\}</title>' index.html; then
  err "index.html has no <title>"
else
  ok "index.html present with doctype and title"
fi

# 2. Every local file index.html points to (css, js, images) is tracked.
missing=""
while IFS= read -r ref; do
  [ -n "$ref" ] || continue
  git ls-files --error-unmatch -- "$ref" >/dev/null 2>&1 || missing="$missing$ref"$'\n'
done < <(grep -oE '(href|src)="[^"#:]+"' index.html 2>/dev/null | sed -E 's/^(href|src)="//; s/"$//' | sort -u)
if [ -n "$missing" ]; then
  err "index.html references files that are not in the repo:"
  printf '%s' "$missing" | sed 's/^/        /'
else
  ok "all local files referenced by index.html exist"
fi

# 3. No archives, executables, env files or key files in the repo (it is public).
blocked=$(git ls-files | grep -Ei '\.(zip|tar|tgz|gz|7z|rar|exe|dmg|pkg|pem|key|p12|pfx)$|(^|/)\.env(\..*)?$' || true)
if [ -n "$blocked" ]; then
  err "blocked file types are tracked:"
  echo "$blocked" | sed 's/^/        /'
else
  ok "no blocked file types"
fi

# 4. No tracked file over 5 MB.
big=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  size=$(wc -c < "$f" | tr -d ' ')
  [ "$size" -gt 5242880 ] && big="$big$f ($size bytes)"$'\n'
done < <(git ls-files)
if [ -n "$big" ]; then
  err "files over 5 MB:"
  printf '%s' "$big" | sed 's/^/        /'
else
  ok "no file over 5 MB"
fi

# 5. No credentials. Only file names are printed, never the matching text.
secrets='gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|sk-ant-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}'
leaks=$(git grep -IlE -e "$secrets" -- . || true)
if [ -n "$leaks" ]; then
  err "possible credentials in:"
  echo "$leaks" | sed 's/^/        /'
else
  ok "no credential patterns found"
fi

if [ "$fail" -ne 0 ]; then
  echo "Checks failed."
  exit 1
fi
echo "All checks passed."
