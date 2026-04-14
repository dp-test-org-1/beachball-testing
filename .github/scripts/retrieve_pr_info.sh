#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" ]]; then
  echo "Usage: $0 <commit-hash>" >&2
  exit 1
fi

COMMIT_HASH="$1"
SHORT_COMMIT_HASH="${COMMIT_HASH:0:8}"

get_pulls_for_commit() {
  local commit_hash="$1"
  gh api -H "Accept: application/vnd.github+json" "/repos/${GITHUB_REPOSITORY}/commits/${commit_hash}/pulls" 2>/dev/null || echo "[]"
}

get_pull_by_number() {
  local pr_number="$1"
  gh api -H "Accept: application/vnd.github+json" "/repos/${GITHUB_REPOSITORY}/pulls/${pr_number}" 2>/dev/null || echo "{}"
}

normalize_pulls_json() {
  local pulls_json="$1"
  echo "$pulls_json" | jq -c 'if type == "array" then . else [] end' 2>/dev/null || echo "[]"
}

get_commit_message() {
  local commit_hash="$1"
  local commit_json
  commit_json="$(gh api -H "Accept: application/vnd.github+json" "/repos/${GITHUB_REPOSITORY}/commits/${commit_hash}" 2>/dev/null || echo "{}")"
  echo "$commit_json" | jq -r '.commit.message // ""'
}

extract_original_commit_hash() {
  local commit_message="$1"
  local original_hash=""

  original_hash="$(echo "$commit_message" | sed -nE 's/.*[Cc]herry[ -]picked from commit ([0-9A-Fa-f]{7,40}).*/\1/p' | head -n1)"

  if [[ -z "$original_hash" ]]; then
    original_hash="$(echo "$commit_message" | sed -nE 's/.*[Cc]herry[ -]pick(ed)?[[:space:]]+([0-9A-Fa-f]{7,40}).*/\2/p' | head -n1)"
  fi

  echo "$original_hash"
}

extract_pr_number_from_title() {
  local commit_title="$1"
  echo "$commit_title" | sed -nE 's/.*\(#([0-9]+)\)[[:space:]]*$/\1/p' | head -n1
}

emit_failure_json() {
  local commit_title="$1"
  if [[ -z "$commit_title" ]]; then
    commit_title="Cherry-pick $SHORT_COMMIT_HASH"
  fi

  jq -n \
    --arg title "$commit_title" \
    --arg cherryPickedLine "- Cherry-picked from commit $COMMIT_HASH" \
    '{
      PRSuccess: false,
      description: "",
      id: "",
      title: $title,
      cherryPickedLine: $cherryPickedLine,
      authorId: "",
      workItemIds: ""
    }'
}

if [[ -z "${GITHUB_REPOSITORY:-}" ]]; then
  echo "GITHUB_REPOSITORY is required" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

COMMIT_MESSAGE="$(get_commit_message "$COMMIT_HASH")"
COMMIT_TITLE="$(echo "$COMMIT_MESSAGE" | head -n1)"

ORIGINAL_COMMIT_HASH="$(extract_original_commit_hash "$COMMIT_MESSAGE")"
PR_NUMBER_FROM_TITLE="$(extract_pr_number_from_title "$COMMIT_TITLE")"

LOOKUP_COMMIT_HASH="$COMMIT_HASH"
PULLS_JSON="$(normalize_pulls_json "$(get_pulls_for_commit "$LOOKUP_COMMIT_HASH")")"

if [[ "$(echo "$PULLS_JSON" | jq 'length')" == "0" && -n "$ORIGINAL_COMMIT_HASH" ]]; then
  LOOKUP_COMMIT_HASH="$ORIGINAL_COMMIT_HASH"
  PULLS_JSON="$(normalize_pulls_json "$(get_pulls_for_commit "$LOOKUP_COMMIT_HASH")")"
fi

if [[ "$(echo "$PULLS_JSON" | jq 'length')" == "0" && -n "$PR_NUMBER_FROM_TITLE" ]]; then
  PR_JSON_FROM_TITLE="$(get_pull_by_number "$PR_NUMBER_FROM_TITLE")"
  if [[ "$(echo "$PR_JSON_FROM_TITLE" | jq -r '.number // ""')" != "" ]]; then
    PULLS_JSON="$(jq -cn --argjson pr "$PR_JSON_FROM_TITLE" '[ $pr ]')"
  fi
fi

if [[ "$(echo "$PULLS_JSON" | jq 'length')" == "0" ]]; then
  emit_failure_json "$COMMIT_TITLE"
  exit 0
fi

PR_JSON="$(echo "$PULLS_JSON" | jq '.[0]')"

PR_NUMBER="$(echo "$PR_JSON" | jq -r '.number')"
PR_TITLE="$(echo "$PR_JSON" | jq -r '.title // ""')"
PR_DESCRIPTION="$(echo "$PR_JSON" | jq -r '.body // ""')"
PR_AUTHOR="$(echo "$PR_JSON" | jq -r '.user.login // ""')"
PR_URL="$(echo "$PR_JSON" | jq -r '.html_url // ""')"

if [[ -n "$PR_URL" ]]; then
  CHERRY_PICKED_LINE="- Cherry-picked from #${PR_NUMBER} (${PR_URL})"
else
  CHERRY_PICKED_LINE="- Cherry-picked from #${PR_NUMBER}"
fi

jq -n \
  --arg id "$PR_NUMBER" \
  --arg title "$PR_TITLE" \
  --arg description "$PR_DESCRIPTION" \
  --arg cherryPickedLine "$CHERRY_PICKED_LINE" \
  --arg authorId "$PR_AUTHOR" \
  '{
    PRSuccess: true,
    description: $description,
    id: $id,
    title: $title,
    cherryPickedLine: $cherryPickedLine,
    authorId: $authorId,
    workItemIds: ""
  }'