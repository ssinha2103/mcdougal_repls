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
  echo "Docker Compose is required (install Docker Desktop or docker-compose)." >&2
  exit 1
fi

export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"
export COMPOSE_DOCKER_CLI_BUILD="${COMPOSE_DOCKER_CLI_BUILD:-1}"
export COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-1}"

COMPOSE_ARGS=(-f docker-compose.yml -f docker-compose.prod.yml)

if [[ ! -f docker-compose.yml || ! -f docker-compose.prod.yml || ! -f apps-manifests/apps.tsv ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

if [[ ! -f env/global.env ]]; then
  ./scripts/generate_global_env.sh >/dev/null
  echo "Created env/global.env from detected keys. Fill real credentials if needed."
fi

mapfile -t SERVICES < <(awk -F '\t' '$2 != "unsupported" { print $1 }' apps-manifests/apps.tsv)
total="${#SERVICES[@]}"

echo "Deploying production stack sequentially (parallel disabled)."
echo "Services to deploy: $total"

echo "Starting core services..."
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d postgres
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d gateway
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d caddy

idx=0
for slug in "${SERVICES[@]}"; do
  idx=$((idx + 1))
  echo "[$idx/$total] Building $slug ..."
  "${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" build "$slug"
  echo "[$idx/$total] Recreating $slug ..."
  "${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d --no-deps --force-recreate "$slug"
done

echo "Reloading gateway config..."
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" exec -T gateway nginx -t >/dev/null
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" exec -T gateway nginx -s reload >/dev/null || true

echo
echo "Final service status:"
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" ps

domain="$(awk -F= '/^DOMAIN=/{print substr($0, index($0, "=")+1)}' env/global.env | tail -n1 || true)"
if [[ -n "$domain" ]]; then
  echo
  echo "Production deploy completed. Base URL: https://$domain"
else
  echo
  echo "Production deploy completed. Set DOMAIN in env/global.env for HTTPS URL output."
fi
