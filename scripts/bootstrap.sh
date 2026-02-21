#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

LIMIT="${1:-}"
if [[ -n "$LIMIT" && ! "$LIMIT" =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 [limit]"
  echo "Example: $0 5"
  exit 1
fi

echo "[1/5] Generating stack files..."
./scripts/generate_stack.sh >/dev/null

echo "[2/5] Preparing centralized env file..."
./scripts/generate_global_env.sh >/dev/null

if [[ -f "env/global.env" ]]; then
  echo "[3/5] Applying non-empty global env values..."
  ./scripts/apply_global_env.sh env/global.env >/dev/null
else
  echo "[3/5] Skipped env apply (env/global.env not found)"
fi

echo "[4/5] Starting stack..."
if [[ -n "$LIMIT" ]]; then
  ./scripts/start_stack.sh "$LIMIT"
else
  ./scripts/start_stack.sh
fi

echo "[5/5] Running smoke tests..."
./scripts/smoke_test.sh

echo
echo "Bootstrap complete."
