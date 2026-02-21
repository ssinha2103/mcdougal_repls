#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_ENV_FILE="${1:-env/credentials.request.env}"
OUT_MD_FILE="${2:-apps-manifests/credentials-request.md}"

mkdir -p "$(dirname "$OUT_ENV_FILE")" "$(dirname "$OUT_MD_FILE")"

ENV_FILES="$(
  find env -maxdepth 1 -type f -name '*.env' \
    ! -name 'global.env' \
    ! -name 'global.env.example' \
    ! -name 'credentials.request.env' \
    | sort
)"
if [[ -z "$ENV_FILES" ]]; then
  echo "No app env files found in env/*.env"
  exit 1
fi

records_file="$(mktemp)"

# shellcheck disable=SC2086
awk '
BEGIN { FS="=" }

FNR == 1 {
  app = FILENAME
  sub(/^env\//, "", app)
  sub(/\.env$/, "", app)
}

/^[[:space:]]*#/ || /^[[:space:]]*$/ { next }

$1 ~ /^[A-Z0-9_]+$/ {
  key = $1
  val = substr($0, index($0, "=") + 1)
  sub(/\r$/, "", val)

  status = ""
  if (val == "") {
    status = "missing"
  } else if (val ~ /^local-dev-placeholder/ || val == "replace-with-a-long-random-secret" || val == "local-dev-bucket") {
    status = "placeholder"
  }

  if (status != "") {
    printf "%s\t%s\t%s\n", key, app, status
  }
}
' $ENV_FILES | sort -u > "$records_file"

if [[ ! -s "$records_file" ]]; then
  {
    echo "# Credentials request"
    echo "# No missing or placeholder values found."
  } > "$OUT_ENV_FILE"

  {
    echo "# Credentials Request"
    echo ""
    echo "All app env files already contain concrete values."
  } > "$OUT_MD_FILE"

  rm -f "$records_file"
  echo "Generated: $OUT_ENV_FILE"
  echo "Generated: $OUT_MD_FILE"
  exit 0
fi

{
  echo "# Fill these credentials and send back the values."
  echo "# After filling, run:"
  echo "#   ./scripts/apply_global_env.sh $OUT_ENV_FILE"
  echo ""
  cut -f1 "$records_file" | sort -u | while IFS= read -r key; do
    case "$key" in
      SESSION_SECRET)
        echo "SESSION_SECRET="
        ;;
      DATAFORSEO_LOGIN)
        echo "DATAFORSEO_LOGIN="
        ;;
      DATAFORSEO_PASSWORD)
        echo "DATAFORSEO_PASSWORD="
        ;;
      GCS_BUCKET_NAME)
        echo "GCS_BUCKET_NAME="
        ;;
      *)
        echo "$key="
        ;;
    esac
  done
} > "$OUT_ENV_FILE"

{
  echo "# Credentials Request"
  echo ""
  echo "Generated from app env files with missing/placeholder values."
  echo ""
  echo "| Key | Status | Used By Apps |"
  echo "|---|---|---|"

  cut -f1 "$records_file" | sort -u | while IFS= read -r key; do
    status="placeholder"
    if awk -F'\t' -v k="$key" '$1 == k && $3 == "missing" { found = 1 } END { exit(found ? 0 : 1) }' "$records_file"; then
      status="missing"
    fi
    apps="$(
      awk -F'\t' -v k="$key" '$1 == k { print $2 }' "$records_file" \
        | sort -u \
        | awk 'BEGIN { first = 1 } { if (!first) { printf ", " } printf "%s", $0; first = 0 } END { print "" }'
    )"
    printf "| %s | %s | %s |\n" "$key" "$status" "$apps"
  done
} > "$OUT_MD_FILE"

rm -f "$records_file"

echo "Generated: $OUT_ENV_FILE"
echo "Generated: $OUT_MD_FILE"
