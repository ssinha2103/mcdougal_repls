#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_FILE="${1:-env/global.env.example}"

mkdir -p "$(dirname "$OUT_FILE")"

{
  echo "# Central credentials file for all apps"
  echo "# Fill values once, then run: ./scripts/apply_global_env.sh env/global.env"
  echo ""

  rg --no-filename \
    -g '!credentials.request.env' \
    -g '!global.env' \
    -g '!global.env.example' \
    '^[A-Z0-9_]+=' env/*.env \
    | cut -d'=' -f1 \
    | sort -u \
    | while IFS= read -r key; do
        case "$key" in
          DATABASE_URL)
            echo "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mcdougal_tools"
            ;;
          SESSION_SECRET)
            echo "SESSION_SECRET=replace-with-a-long-random-secret"
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
} > "$OUT_FILE"

if [[ "$OUT_FILE" == "env/global.env.example" && ! -f "env/global.env" ]]; then
  cp "$OUT_FILE" "env/global.env"
fi

echo "Generated: $OUT_FILE"
if [[ -f "env/global.env" ]]; then
  echo "Ready to edit: env/global.env"
fi
