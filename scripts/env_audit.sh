#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STRICT=0
ENV_FILE="env/global.env"

for arg in "$@"; do
  case "$arg" in
    --strict)
      STRICT=1
      ;;
    *)
      if [[ "$ENV_FILE" != "env/global.env" ]]; then
        echo "Usage: $0 [--strict] [env-file]"
        exit 1
      fi
      ENV_FILE="$arg"
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE"
  echo "Generate it with: ./scripts/generate_global_env.sh"
  exit 1
fi

all_keys_file="$(mktemp)"
missing_keys_file="$(mktemp)"
placeholder_keys_file="$(mktemp)"
cleanup() {
  rm -f "$all_keys_file" "$missing_keys_file" "$placeholder_keys_file"
}
trap cleanup EXIT

awk -F'=' '/^[A-Z0-9_]+=/{ print $1 }' "$ENV_FILE" | sort -u > "$all_keys_file"
awk -F'=' '
  /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
  $1 ~ /^[A-Z0-9_]+$/ {
    val = substr($0, index($0, "=") + 1)
    sub(/\r$/, "", val)
    if (val == "") {
      print $1
    }
  }
' "$ENV_FILE" | sort -u > "$missing_keys_file"
awk -F'=' '
  /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
  $1 ~ /^[A-Z0-9_]+$/ {
    val = substr($0, index($0, "=") + 1)
    sub(/\r$/, "", val)
    if (val ~ /^local-dev-placeholder/ || val == "replace-with-a-long-random-secret" || val == "local-dev-bucket") {
      print $1
    }
  }
' "$ENV_FILE" | sort -u > "$placeholder_keys_file"

count_lines() {
  local file="$1"
  if [[ -s "$file" ]]; then
    wc -l < "$file" | tr -d ' '
  else
    echo 0
  fi
}

all_count="$(count_lines "$all_keys_file")"
missing_count="$(count_lines "$missing_keys_file")"
placeholder_count="$(count_lines "$placeholder_keys_file")"

echo "Env Audit"
echo "---------"
echo "file: $ENV_FILE"
echo "total keys: $all_count"
echo "missing: $missing_count"
echo "placeholder: $placeholder_count"

echo
echo "Missing Keys"
echo "------------"
if [[ "$missing_count" -eq 0 ]]; then
  echo "- none"
else
  while IFS= read -r key; do
    [[ -n "$key" ]] || continue
    echo "- $key"
  done < "$missing_keys_file"
fi

echo
echo "Placeholder Keys"
echo "----------------"
if [[ "$placeholder_count" -eq 0 ]]; then
  echo "- none"
else
  while IFS= read -r key; do
    [[ -n "$key" ]] || continue
    echo "- $key"
  done < "$placeholder_keys_file"
fi

if [[ "$missing_count" -gt 0 || ( "$STRICT" -eq 1 && "$placeholder_count" -gt 0 ) ]]; then
  echo
  if [[ "$STRICT" -eq 1 ]]; then
    echo "Audit failed: missing and/or placeholder values detected (strict mode)."
  else
    echo "Audit failed: missing values detected."
  fi
  exit 1
fi

echo
if [[ "$STRICT" -eq 1 ]]; then
  echo "Audit passed (strict)."
else
  echo "Audit passed (non-strict)."
fi
