#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif have docker-compose; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is required." >&2
  exit 1
fi

if ! "${COMPOSE[@]}" ps --status running gateway 2>/dev/null | grep -q 'gateway'; then
  echo "Gateway is not running. Start it with: docker compose up -d gateway"
  exit 0
fi

"${COMPOSE[@]}" exec gateway nginx -t >/dev/null
"${COMPOSE[@]}" exec gateway nginx -s reload >/dev/null
echo "Gateway config reloaded."
