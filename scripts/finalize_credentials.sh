#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="${1:-env/credentials.request.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing credentials file: $ENV_FILE"
  echo "Generate it with: ./scripts/generate_credentials_request.sh"
  exit 1
fi

missing_keys="$(
  awk -F'=' '
    /^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
    $1 ~ /^[A-Z0-9_]+$/ {
      val = substr($0, index($0, "=") + 1)
      sub(/\r$/, "", val)
      if (val == "") {
        print $1
      }
    }
  ' "$ENV_FILE" | sort -u
)"

if [[ -n "$missing_keys" ]]; then
  echo "Credentials file still has empty values:"
  while IFS= read -r key; do
    [[ -n "$key" ]] || continue
    echo "- $key"
  done <<< "$missing_keys"
  echo
  echo "Fill those keys in $ENV_FILE and re-run."
  exit 1
fi

echo "[1/4] Applying credentials to app env files..."
./scripts/apply_global_env.sh "$ENV_FILE" >/dev/null

echo "[2/4] Running strict env audit..."
./scripts/env_audit.sh --strict >/dev/null
echo "      Audit passed."

echo "[3/4] Recreating services with updated env..."
if docker compose up -d --no-build >/tmp/finalize_credentials_up.log 2>&1; then
  echo "      Services recreated."
else
  echo "      Existing images not available; performing build/start sequence."
  ./scripts/start_stack.sh >/dev/null
fi

echo "[4/4] Running smoke tests..."
./scripts/smoke_test.sh

echo
echo "Credentials applied and stack verified."
