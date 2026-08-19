#!/usr/bin/env bash
set -euo pipefail

OWNER="liusan629-eng"
REPO="proofrev-agent-economics"

if ! command -v git >/dev/null 2>&1; then
  echo "git is required."
  exit 2
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required."
  exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "HUMAN ACTION REQUIRED: authenticate GitHub CLI, then rerun this script."
  exit 3
fi

git init
git add .
if ! git diff --cached --quiet; then
  git commit -m "Initial release: proofrev-agent-economics 0.1.0"
fi
git branch -M main

if gh repo view "$OWNER/$REPO" >/dev/null 2>&1; then
  git remote remove origin >/dev/null 2>&1 || true
  git remote add origin "https://github.com/$OWNER/$REPO.git"
else
  gh repo create "$OWNER/$REPO" \
    --public \
    --description "Deterministic zero-dependency utilities for AI-agent revenue evidence and unit economics." \
    --source . \
    --remote origin
fi

git push -u origin main
echo "GitHub publication complete: $OWNER/$REPO"
