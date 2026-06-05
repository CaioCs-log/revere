#!/usr/bin/env bash
set -euo pipefail

# AI-OPS minimal verification.
# This script is intentionally simple and deterministic.

FORBIDDEN_PATTERNS=(
  "^revere-admin/"
  "^revere-storefront/"
  "^revere-backend/"
  "^revere-governance/specs/"
  "^firebase\.json$"
  "^firestore\.rules$"
  "^firestore\.indexes\.json$"
  "^storage\.rules$"
  "^package\.json$"
  "(^|/)package-lock\.json$"
  "(^|/)pnpm-lock\.yaml$"
  "(^|/)yarn\.lock$"
  "^\.github/workflows/"
  "(^|/)\.env(\..*)?$"
)

changed_files=""
if git rev-parse --verify origin/main >/dev/null 2>&1; then
  changed_files="$(git diff --name-only origin/main...HEAD)"
else
  changed_files="$(git diff --name-only HEAD~1...HEAD 2>/dev/null || git diff --name-only)"
fi

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
