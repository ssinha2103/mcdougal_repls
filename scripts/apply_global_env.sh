#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SOURCE_FILE="${1:-env/global.env}"
TARGET_FILE="env/global.env"

if [[ ! -f "$SOURCE_FILE" ]]; then
  echo "Missing env file: $SOURCE_FILE"
  echo "Generate base file with: ./scripts/generate_global_env.sh"
  exit 1
fi

if ! rg -q '^[A-Z0-9_]+=' "$SOURCE_FILE"; then
  echo "No keys found in $SOURCE_FILE"
  exit 1
fi

if [[ "$SOURCE_FILE" == "$TARGET_FILE" ]]; then
  echo "Using $TARGET_FILE directly (single env mode)."
  exit 0
fi

if [[ ! -f "$TARGET_FILE" ]]; then
  ./scripts/generate_global_env.sh "$TARGET_FILE" >/dev/null
fi

upsert_key() {
  local file="$1"
  local key="$2"
  local value="$3"
  local tmp_file
  tmp_file="$(mktemp)"

  awk -v key="$key" -v value="$value" '
  BEGIN { replaced = 0 }
  $0 ~ ("^" key "=") {
    if (!replaced) {
      print key "=" value
      replaced = 1
    }
    next
  }
  { print }
  END {
    if (!replaced) {
      print key "=" value
    }
  }
  ' "$file" > "$tmp_file"

  mv "$tmp_file" "$file"
}

updated=0
added=0

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^([A-Z0-9_]+)=(.*)$ ]] || continue

  key="${BASH_REMATCH[1]}"
  value="${BASH_REMATCH[2]}"
  [[ -n "$value" ]] || continue

  existing_line="$(rg --no-filename "^${key}=" "$TARGET_FILE" | head -n1 || true)"
  if [[ -z "$existing_line" ]]; then
    added=$((added + 1))
  elif [[ "${existing_line#*=}" != "$value" ]]; then
    updated=$((updated + 1))
  else
    continue
  fi

  upsert_key "$TARGET_FILE" "$key" "$value"
done < "$SOURCE_FILE"

echo "Applied non-empty values from $SOURCE_FILE -> $TARGET_FILE"
echo "Added keys: $added"
echo "Updated keys: $updated"
