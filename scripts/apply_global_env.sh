#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GLOBAL_FILE="${1:-env/global.env}"

if [[ ! -f "$GLOBAL_FILE" ]]; then
  echo "Missing global env file: $GLOBAL_FILE"
  echo "Create it from template: ./scripts/generate_global_env.sh"
  exit 1
fi

if ! rg -q '^[A-Z0-9_]+=' "$GLOBAL_FILE"; then
  echo "No keys found in $GLOBAL_FILE"
  exit 1
fi

updated_files=0
for app_env in env/*.env; do
  case "$(basename "$app_env")" in
    global.env|global.env.example|credentials.request.env)
      continue
      ;;
  esac

  tmp_file="$(mktemp)"
  changed=0

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^([A-Z0-9_]+)= ]]; then
      key="${BASH_REMATCH[1]}"
      global_line="$(rg --no-filename "^${key}=" "$GLOBAL_FILE" | tail -n1 || true)"
      global_value="${global_line#*=}"

      if [[ -n "$global_line" && -n "$global_value" ]]; then
        new_line="$key=$global_value"
        if [[ "$line" != "$new_line" ]]; then
          changed=1
        fi
        echo "$new_line" >> "$tmp_file"
      else
        echo "$line" >> "$tmp_file"
      fi
    else
      echo "$line" >> "$tmp_file"
    fi
  done < "$app_env"

  if [[ "$changed" -eq 1 ]]; then
    mv "$tmp_file" "$app_env"
    updated_files=$((updated_files + 1))
    echo "Updated: $app_env"
  else
    rm -f "$tmp_file"
  fi
done

echo "Done. Updated files: $updated_files"
