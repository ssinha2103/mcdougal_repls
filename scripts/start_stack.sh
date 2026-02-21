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

LIMIT="${1:-}"
if [[ -n "$LIMIT" && ! "$LIMIT" =~ ^[0-9]+$ ]]; then
  echo "Usage: $0 [limit]"
  echo "Example: $0 5"
  exit 1
fi

if [[ ! -f apps-manifests/apps.tsv ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

echo "Starting core services (gateway + postgres)..."
"${COMPOSE[@]}" up -d postgres gateway >/dev/null

declare -a SUCCESS=()
declare -a FAILED=()
declare -a WARN=()

started=0
while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  if [[ -n "$LIMIT" && "$started" -ge "$LIMIT" ]]; then
    break
  fi

  idx=$((started + 1))
  echo "[$idx] Building/starting $slug on localhost:$host_port ..."

  if "${COMPOSE[@]}" up -d --build "$slug" >/tmp/start_${slug}.log 2>&1; then
    sleep 2
    status_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${host_port}" || true)"
    if [[ "$status_code" =~ ^(200|301|302|304|307|308|401|403)$ ]]; then
      SUCCESS+=("$slug:$host_port:$status_code")
      echo "    OK ($status_code)"
    else
      WARN+=("$slug:$host_port:$status_code")
      echo "    WARN (HTTP $status_code)"
    fi
  else
    FAILED+=("$slug:$host_port")
    echo "    FAIL (see /tmp/start_${slug}.log)"
  fi

  started=$((started + 1))
done < apps-manifests/apps.tsv

echo
echo "Summary"
echo "-------"
echo "Started: $started"
echo "Healthy/Warm: ${#SUCCESS[@]}"
echo "Warnings: ${#WARN[@]}"
echo "Failed: ${#FAILED[@]}"

if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo
  echo "Failed services:"
  for row in "${FAILED[@]}"; do
    echo "- $row"
  done
fi

if [[ ${#WARN[@]} -gt 0 ]]; then
  echo
  echo "Warnings (not serving expected status yet):"
  for row in "${WARN[@]}"; do
    echo "- $row"
  done
fi
