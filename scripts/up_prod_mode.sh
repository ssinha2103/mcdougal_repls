#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f "docker-compose.yml" || ! -f "docker-compose.prod.yml" || ! -f "env/global.env" ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

./scripts/deploy_prod_sequential.sh

domain=""
if [[ -f env/global.env ]]; then
  configured_domain="$(grep -E '^DOMAIN=' env/global.env | tail -n1 | cut -d'=' -f2- || true)"
  if [[ -n "$configured_domain" ]]; then
    domain="$configured_domain"
  fi
fi

if [[ -n "$domain" ]]; then
  echo "Production mode stack started. HTTPS endpoint: https://$domain"
else
  echo "Production mode stack started. Set DOMAIN in env/global.env to use your domain."
fi
