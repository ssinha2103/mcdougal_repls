#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_FILE="${1:-env/global.env.example}"
GLOBAL_FILE="env/global.env"

mkdir -p "$(dirname "$OUT_FILE")"

collect_env_keys() {
  local dir="$1"
  {
    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "process\\.env\\.[A-Z0-9_]+" "$dir" 2>/dev/null | sed -E 's/.*\.//' || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "process\\.env\\[['\"][A-Z0-9_]+['\"]\\]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.getenv\\(['\"][A-Z0-9_]+['\"]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.environ\\.get\\(['\"][A-Z0-9_]+['\"]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.environ\\[['\"][A-Z0-9_]+['\"]\\]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
  } \
    | rg -v '^(NODE_ENV|PORT|REPL_ID|REPL_SLUG|REPLIT_DEPLOYMENT|REPL_DEPLOYMENT|REPLIT_DEV_DOMAIN|REPLIT_INTERNAL_APP_DOMAIN)$' \
    | sort -u || true
}

is_placeholder_value() {
  local value="$1"
  [[ "$value" == local-dev-placeholder* || "$value" == "replace-with-a-long-random-secret" || "$value" == "local-dev-bucket" ]]
}

default_env_value() {
  local key="$1"
  case "$key" in
    DATABASE_URL)
      echo "postgresql://postgres:postgres@postgres:5432/mcdougal_tools"
      ;;
    SESSION_SECRET)
      echo "replace-with-a-long-random-secret"
      ;;
    DATAFORSEO_LOGIN)
      echo "local-dev-placeholder-login"
      ;;
    DATAFORSEO_PASSWORD)
      echo "local-dev-placeholder-password"
      ;;
    GCS_BUCKET_NAME)
      echo "local-dev-bucket"
      ;;
    *)
      echo ""
      ;;
  esac
}

lookup_existing_value() {
  local key="$1"
  local base_file="$2"
  local base_value=""

  if [[ -f "$base_file" ]]; then
    local base_line
    base_line="$(rg --no-filename "^${key}=" "$base_file" | tail -n1 || true)"
    if [[ -n "$base_line" ]]; then
      base_value="${base_line#*=}"
    fi
  fi

  if [[ -n "$base_value" ]] && ! is_placeholder_value "$base_value"; then
    echo "$base_value"
    return
  fi

  local fallback="$base_value"
  local app_env
  for app_env in env/*.env; do
    [[ -f "$app_env" ]] || continue
    case "$(basename "$app_env")" in
      global.env|global.env.example|credentials.request.env)
        continue
        ;;
    esac

    local app_line
    app_line="$(rg --no-filename "^${key}=" "$app_env" | tail -n1 || true)"
    [[ -n "$app_line" ]] || continue

    local app_value="${app_line#*=}"
    [[ -n "$app_value" ]] || continue

    if ! is_placeholder_value "$app_value"; then
      echo "$app_value"
      return
    fi

    if [[ -z "$fallback" ]]; then
      fallback="$app_value"
    fi
  done

  if [[ -n "$fallback" ]]; then
    echo "$fallback"
    return
  fi

  default_env_value "$key"
}

all_keys_file="$(mktemp)"
all_keys_sorted_file="$(mktemp)"
cleanup() {
  rm -f "$all_keys_file" "$all_keys_sorted_file"
}
trap cleanup EXIT

while IFS= read -r app_dir; do
  keys="$(collect_env_keys "$app_dir")"
  if [[ -n "$keys" ]]; then
    echo "$keys" >> "$all_keys_file"
  fi
done < <(find apps -mindepth 1 -maxdepth 1 -type d | sort)

if [[ -s "$all_keys_file" ]]; then
  sort -u "$all_keys_file" > "$all_keys_sorted_file"
fi

base_file="$OUT_FILE"
if [[ "$OUT_FILE" == "$GLOBAL_FILE" ]]; then
  base_file="$GLOBAL_FILE"
elif [[ -f "$GLOBAL_FILE" ]]; then
  base_file="$GLOBAL_FILE"
fi

{
  echo "# Central credentials file for all apps"
  echo "# Fill values once for the full stack"
  echo ""

  if [[ -s "$all_keys_sorted_file" ]]; then
    while IFS= read -r key; do
      [[ -n "$key" ]] || continue
      value="$(lookup_existing_value "$key" "$base_file")"
      echo "$key=$value"
    done < "$all_keys_sorted_file"
  fi
} > "$OUT_FILE"

if [[ "$OUT_FILE" == "env/global.env.example" && ! -f "$GLOBAL_FILE" ]]; then
  cp "$OUT_FILE" "$GLOBAL_FILE"
fi

echo "Generated: $OUT_FILE"
if [[ -f "$GLOBAL_FILE" ]]; then
  echo "Ready to edit: $GLOBAL_FILE"
fi
