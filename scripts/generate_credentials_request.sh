#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

SOURCE_ENV_FILE="${1:-env/global.env}"
OUT_ENV_FILE="${2:-env/credentials.request.env}"
OUT_MD_FILE="${3:-apps-manifests/credentials-request.md}"

mkdir -p "$(dirname "$OUT_ENV_FILE")" "$(dirname "$OUT_MD_FILE")"

if [[ ! -f "$SOURCE_ENV_FILE" ]]; then
  echo "Missing source env file: $SOURCE_ENV_FILE"
  echo "Generate it with: ./scripts/generate_global_env.sh"
  exit 1
fi

records_file="$(mktemp)"
cleanup() {
  rm -f "$records_file"
}
trap cleanup EXIT

awk -F'=' '
/^[[:space:]]*#/ || /^[[:space:]]*$/ { next }
$1 ~ /^[A-Z0-9_]+$/ {
  key = $1
  val = substr($0, index($0, "=") + 1)
  sub(/\r$/, "", val)

  if (val == "") {
    printf "%s\tmissing\n", key
  } else if (val ~ /^local-dev-placeholder/ || val == "replace-with-a-long-random-secret" || val == "local-dev-bucket") {
    printf "%s\tplaceholder\n", key
  }
}
' "$SOURCE_ENV_FILE" | sort -u > "$records_file"

if [[ ! -s "$records_file" ]]; then
  {
    echo "# Credentials request"
    echo "# No missing or placeholder values found in $SOURCE_ENV_FILE"
  } > "$OUT_ENV_FILE"

  {
    echo "# Credentials Request"
    echo ""
    echo "No missing or placeholder values found in $SOURCE_ENV_FILE."
  } > "$OUT_MD_FILE"

  echo "Generated: $OUT_ENV_FILE"
  echo "Generated: $OUT_MD_FILE"
  exit 0
fi

apps_for_key() {
  local key="$1"
  local matches
  local pattern="process\\.env\\.${key}|process\\.env\\[['\\\"]${key}['\\\"]\\]|os\\.getenv\\(['\\\"]${key}['\\\"]|os\\.environ\\.get\\(['\\\"]${key}['\\\"]|os\\.environ\\[['\\\"]${key}['\\\"]\\]"
  matches="$(
    rg -l \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "$pattern" \
      apps 2>/dev/null || true
  )"

  if [[ -z "$matches" ]]; then
    echo "(not detected)"
    return
  fi

  echo "$matches" \
    | awk -F'/' '/^apps\// { print $2 }' \
    | sort -u \
    | paste -sd',' - \
    | sed 's/,/, /g'
}

{
  echo "# Fill these credentials and send back the values."
  echo "# After filling, run:"
  echo "#   ./scripts/apply_global_env.sh $OUT_ENV_FILE"
  echo ""
  cut -f1 "$records_file" | sort -u | while IFS= read -r key; do
    echo "$key="
  done
} > "$OUT_ENV_FILE"

{
  echo "# Credentials Request"
  echo ""
  echo "Generated from missing/placeholder values in $SOURCE_ENV_FILE."
  echo ""
  echo "| Key | Status | Used By Apps |"
  echo "|---|---|---|"

  cut -f1 "$records_file" | sort -u | while IFS= read -r key; do
    status="placeholder"
    if awk -F'\t' -v k="$key" '$1 == k && $2 == "missing" { found = 1 } END { exit(found ? 0 : 1) }' "$records_file"; then
      status="missing"
    fi
    apps="$(apps_for_key "$key")"
    printf "| %s | %s | %s |\\n" "$key" "$status" "$apps"
  done
} > "$OUT_MD_FILE"

echo "Generated: $OUT_ENV_FILE"
echo "Generated: $OUT_MD_FILE"
