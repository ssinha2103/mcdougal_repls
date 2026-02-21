#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! docker compose ps --status running gateway 2>/dev/null | rg -q 'gateway'; then
  echo "Gateway is not running. Start it with: docker compose up -d gateway"
  exit 0
fi

docker compose exec gateway nginx -t >/dev/null
docker compose exec gateway nginx -s reload >/dev/null
echo "Gateway config reloaded."
