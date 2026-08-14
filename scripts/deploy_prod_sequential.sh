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
NOTIFIER_INGRESS_NETWORK="algo-trader-notifier-ingress"

if [[ ! -f docker-compose.yml || ! -f docker-compose.prod.yml || ! -f apps-manifests/apps.tsv ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

if [[ ! -f env/global.env ]]; then
  ./scripts/generate_global_env.sh >/dev/null
  echo "Created env/global.env from detected keys. Fill real credentials if needed."
fi

mapfile -t SERVICE_ROWS < <(awk -F '\t' '$2 != "unsupported" { print $1 "\t" $2 }' apps-manifests/apps.tsv)
total="${#SERVICE_ROWS[@]}"

echo "Deploying production stack sequentially (parallel disabled)."
echo "Services to deploy: $total"

if ! docker network inspect "$NOTIFIER_INGRESS_NETWORK" >/dev/null 2>&1; then
  docker network create --driver bridge --attachable "$NOTIFIER_INGRESS_NETWORK" >/dev/null
fi

echo "Starting core services..."
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d postgres

idx=0
for row in "${SERVICE_ROWS[@]}"; do
  slug="${row%%$'\t'*}"
  type="${row#*$'\t'}"
  idx=$((idx + 1))
  echo "[$idx/$total] Building $slug ..."
  "${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" build "$slug"
  echo "[$idx/$total] Recreating $slug ..."
  "${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d --no-deps --force-recreate "$slug"

  # If a Node app defines a db:push script, apply schema changes automatically.
  if [[ "$type" == "node_replit" ]] && [[ -f "apps/$slug/package.json" ]] && grep -q '"db:push"' "apps/$slug/package.json"; then
    echo "[$idx/$total] Running db:push for $slug ..."
    if "${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" exec -T "$slug" npm run db:push >/tmp/dbpush_"$slug".log 2>&1; then
      echo "[$idx/$total] db:push complete for $slug"
    else
      echo "[$idx/$total] WARN: db:push failed for $slug (see /tmp/dbpush_$slug.log)"
    fi
  fi
done

echo "Starting gateway and TLS proxy..."
"${COMPOSE[@]}" "${COMPOSE_ARGS[@]}" up -d gateway caddy

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
