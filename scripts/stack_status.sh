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

if [[ ! -f apps-manifests/apps.tsv ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

printf "service\thost_port\thttp_direct\thttp_route\tcontainer\n"
while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  http_direct_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${host_port}" || true)"
  http_route_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8000/${slug}/" || true)"

  container_status="stopped"
  if "${COMPOSE[@]}" ps --status running "$slug" 2>/dev/null | grep -q "$slug"; then
    container_status="running"
  fi

  echo -e "${slug}\t${host_port}\t${http_direct_code}\t${http_route_code}\t${container_status}"
done < apps-manifests/apps.tsv
