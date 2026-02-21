#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "docker-compose.yml" || ! -f "docker-compose.prod.yml" ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
./scripts/reload_gateway.sh >/dev/null || true
echo "Production mode stack started (gateway-only exposure)."
