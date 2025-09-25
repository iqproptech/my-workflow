#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <issue_number>"
  exit 1
fi

ISSUE_NUM="$1"

# Ensure deps exist
command -v gh >/dev/null 2>&1 || { echo "gh not found. Install GitHub CLI."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git not found."; exit 1; }
mkdir -p scratchpads

echo "==> Fetching issue #$ISSUE_NUM"
ISSUE_JSON="$(gh issue view "$ISSUE_NUM" --json number,title,body,url 2>/dev/null)"
if [ -z "$ISSUE_JSON" ]; then
  echo "Could not fetch issue #$ISSUE_NUM. Are you in the right repo and authed (gh auth status)?"
  exit 1
fi

TITLE="$(echo "$ISSUE_JSON" | jq -r '.title')"
URL="$(echo "$ISSUE_JSON" | jq -r '.url')"

# Make a slug from the title (lowercase, alnum and dashes)
SLUG="$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g;s/^-+|-+$//g' )"
BRANCH="issue/${ISSUE_NUM}-${SLUG}"
PLAN_FILE="scratchpads/issue-${ISSUE_NUM}.md"

echo "==> Writing plan to ${PLAN_FILE}"
{
  echo "# Plan for Issue #${ISSUE_NUM}: ${TITLE}"
  echo
  echo "Issue: ${URL}"
  echo
  echo "## Checklist"
  echo "- [ ] Outline tiny steps to implement"
  echo "- [ ] Make minimal code changes"
  echo "- [ ] Update/add tests if needed"
} > "$PLAN_FILE"

echo "==> Creating/switching branch ${BRANCH}"
git fetch origin || true
git checkout -B "$BRANCH" origin/main || git checkout -b "$BRANCH"

# (Optional) run smoke test pre-change to prove baseline is green
if [ -f server.js ] && [ -f mcp-smoke-test.js ]; then
  echo "==> Running baseline smoke test"
  node server.js & echo $! > .server.pid
  npx --yes wait-on http://localhost:3000
  node mcp-smoke-test.js
  kill $(cat .server.pid) || true
fi

echo "==> Committing plan file (and any staged tiny edits)"
git add "$PLAN_FILE" || true
git commit -m "docs(issue #${ISSUE_NUM}): add plan" || echo "Nothing to commit yet."

echo "==> Pushing branch"
git push -u origin "$BRANCH"

echo "==> Creating PR"
PR_URL="$(gh pr create \
  --title "[${ISSUE_NUM}] ${TITLE}" \
  --body "Plan:\n$(cat "$PLAN_FILE")" \
  2>/dev/null | tail -n1)"

if [ -z "$PR_URL" ]; then
  echo "PR creation may have printed above. If not, run: gh pr create"
else
  echo "==> PR: $PR_URL"
fi

echo "Done."