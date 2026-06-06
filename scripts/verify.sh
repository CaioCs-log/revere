#!/usr/bin/env bash
set -euo pipefail

# AI-OPS minimal verification.
# This script is intentionally simple and deterministic.

FORBIDDEN_PATTERNS=(
  "^AGENTS\.md$"
  "^ai-ops/"
  "^revere-admin/"
  "^revere-storefront/"
  "^revere-backend/"
  "^revere-governance/specs/"
  "^revere-governance/decisions/"
  "(^|/)features\.json$"
  "^firebase\.json$"
  "^firestore\.rules$"
  "^firestore\.indexes\.json$"
  "^storage\.rules$"
  "^scripts/"
  "^\.github/CODEOWNERS$"
  "^\.github/dependabot\.yml$"
  "^package\.json$"
  "(^|/)package-lock\.json$"
  "(^|/)pnpm-lock\.yaml$"
  "(^|/)yarn\.lock$"
  "(^|/)tsconfig\.json$"
  "(^|/)next\.config\."
  "(^|/)vite\.config\."
  "(^|/)eslint\.config\."
  "^\.github/workflows/"
  "(^|/)\.env(\..*)?$"
)

base_changed_files=""
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  base_changed_files="$(git diff --name-only origin/main...HEAD)"
else
  base_changed_files="$(git diff --name-only HEAD~1...HEAD 2>/dev/null || true)"
fi

staged_files="$(git diff --name-only --cached)"
unstaged_files="$(git diff --name-only)"
untracked_files="$(git ls-files --others --exclude-standard)"

changed_files="$(
  printf "%s\n%s\n%s\n%s\n" \
    "${base_changed_files}" \
    "${staged_files}" \
    "${unstaged_files}" \
    "${untracked_files}" |
    sed '/^$/d' |
    sort -u
)"

if [[ -z "${changed_files}" ]]; then
  echo "AI-OPS verify: no changed files detected."
  exit 0
fi

echo "AI-OPS verify: changed files"
echo "${changed_files}"

for file in ${changed_files}; do
  for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    if [[ "${file}" =~ ${pattern} ]]; then
      echo "AI-OPS verify failed: forbidden path changed: ${file}" >&2
      exit 1
    fi
  done
done

echo "AI-OPS verify: OK"
