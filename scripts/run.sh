#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

have() { command -v "$1" >/dev/null 2>&1; }
export DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-1}"
export COMPOSE_DOCKER_CLI_BUILD="${COMPOSE_DOCKER_CLI_BUILD:-1}"
export COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-1}"

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif have docker-compose; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is required (install Docker Desktop or docker-compose)." >&2
  exit 1
fi

ensure_stack_files() {
  if [[ ! -f docker-compose.yml || ! -f apps-manifests/apps.tsv ]]; then
    ./scripts/generate_stack.sh >/dev/null
  fi
}

ensure_legacy_compose_compat() {
  if [[ "${COMPOSE[0]}" == "docker-compose" ]] && [[ -f docker-compose.yml ]]; then
    if grep -q '^name:[[:space:]]' docker-compose.yml; then
      tmp_file="$(mktemp)"
      grep -v '^name:[[:space:]]' docker-compose.yml > "$tmp_file"
      mv "$tmp_file" docker-compose.yml
      echo "Adjusted docker-compose.yml for legacy docker-compose (removed top-level name)."
    fi
  fi
}

ensure_setup_files() {
  ensure_stack_files
  ensure_legacy_compose_compat
  if [[ ! -f env/global.env ]]; then
    ./scripts/generate_global_env.sh >/dev/null
    echo "Created env/global.env (fill real credentials for full functionality)."
  fi
}

reload_gateway_if_running() {
  ./scripts/reload_gateway.sh >/dev/null 2>&1 || true
}

usage() {
  cat <<'USAGE'
Usage: scripts/run.sh <command> [options]

Core commands:
  up                 Generate files + start stack attached
  up-d               Generate files + start stack detached (no forced rebuild)
  up-core            Start only gateway + postgres + free-seo-tools-page
  up-d-build         Generate files + rebuild + start stack detached
  up-prod            Start production mode (Caddy TLS on 80/443 + gateway-only app exposure)
  deploy-prod        Sequential production deploy (build/recreate one service at a time)
  down               Stop the stack
  reup               Recreate stack detached (no forced rebuild)
  ps                 Show compose service status
  logs [services]    Tail logs (all or selected services)

Repo helpers:
  start [N]          Sequential start (all apps or first N)
  bootstrap [N]      Generate/env/apply/start/smoke flow
  smoke [--gateway-only]
  status             Per-app HTTP status table
  regen              Regenerate stack files and reload gateway
  reload-gateway     Reload nginx config in gateway

Env helpers:
  env                Generate/update env/global.env(.example)
  apply-env [FILE]   Merge non-empty values from FILE into env/global.env
  audit [--strict]   Audit env/global.env (or a custom env file)
  creds              Generate credentials request files from env/global.env
  finalize [FILE]    Apply creds + strict audit + restart + smoke

Examples:
  ./run.sh up-d
  ./run.sh logs gateway free-seo-tools-page
  ./run.sh smoke --gateway-only
  ./run.sh finalize env/credentials.request.env
USAGE
}

cmd="${1:-help}"
shift || true

case "$cmd" in
  up)
    ensure_setup_files
    "${COMPOSE[@]}" up
    reload_gateway_if_running
    ;;
  up-d)
    ensure_setup_files
    "${COMPOSE[@]}" up -d
    reload_gateway_if_running
    ;;
  up-core)
    ensure_setup_files
    "${COMPOSE[@]}" up -d postgres gateway free-seo-tools-page
    reload_gateway_if_running
    ;;
  up-d-build)
    ensure_setup_files
    ./scripts/start_stack.sh
    reload_gateway_if_running
    ;;
  up-prod)
    ensure_setup_files
    ./scripts/up_prod_mode.sh
    reload_gateway_if_running
    ;;
  deploy-prod)
    ensure_setup_files
    ./scripts/deploy_prod_sequential.sh
    ;;
  down)
    "${COMPOSE[@]}" down
    ;;
  reup)
    ensure_setup_files
    "${COMPOSE[@]}" down
    "${COMPOSE[@]}" up -d
    reload_gateway_if_running
    ;;
  ps)
    "${COMPOSE[@]}" ps
    ;;
  logs)
    if [[ "$#" -gt 0 ]]; then
      "${COMPOSE[@]}" logs -f "$@"
    else
      "${COMPOSE[@]}" logs -f
    fi
    ;;
  start)
    ./scripts/start_stack.sh "$@"
    ;;
  bootstrap)
    ./scripts/bootstrap.sh "$@"
    ;;
  smoke)
    ./scripts/smoke_test.sh "$@"
    ;;
  status)
    ./scripts/stack_status.sh
    ;;
  regen)
    ./scripts/generate_stack.sh
    ./scripts/reload_gateway.sh || true
    ;;
  reload-gateway)
    ./scripts/reload_gateway.sh
    ;;
  env)
    ./scripts/generate_global_env.sh
    ;;
  apply-env)
    ./scripts/apply_global_env.sh "${1:-env/global.env}"
    ;;
  audit)
    ./scripts/env_audit.sh "$@"
    ;;
  creds)
    ./scripts/generate_credentials_request.sh
    ;;
  finalize)
    ./scripts/finalize_credentials.sh "${1:-env/credentials.request.env}"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    echo
    usage
    exit 1
    ;;
esac
