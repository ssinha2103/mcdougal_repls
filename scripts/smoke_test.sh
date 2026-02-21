#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

GATEWAY_ONLY=0
if [[ "${1:-}" == "--gateway-only" ]]; then
  GATEWAY_ONLY=1
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--gateway-only]"
  exit 1
fi

if [[ ! -f apps-manifests/apps.tsv ]]; then
  ./scripts/generate_stack.sh >/dev/null
fi

echo "Checking gateway home..."
gateway_code="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000 || true)"
if [[ "$gateway_code" != "200" ]]; then
  echo "FAIL: gateway home returned $gateway_code"
  exit 1
fi
echo "OK: gateway home (200)"

total=0
ok=0
fail=0

echo
echo "Per-app checks"
echo "--------------"
while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  total=$((total + 1))
  direct_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${host_port}" || true)"
  route_base_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8000/${slug}" || true)"
  route_app_code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8000/${slug}/" || true)"

  if [[ "$GATEWAY_ONLY" -eq 1 \
        && "$route_base_code" =~ ^(301|302|307|308)$ \
        && "$route_app_code" =~ ^(200|301|302|304|307|308|401|403)$ ]]; then
    ok=$((ok + 1))
    printf "OK   %-24s route_base=%s route_app=%s\n" "$slug" "$route_base_code" "$route_app_code"
  elif [[ "$GATEWAY_ONLY" -eq 0 \
          && "$direct_code" =~ ^(200|301|302|304|307|308|401|403)$ \
          && "$route_base_code" =~ ^(301|302|307|308)$ \
          && "$route_app_code" =~ ^(200|301|302|304|307|308|401|403)$ ]]; then
    ok=$((ok + 1))
    printf "OK   %-24s direct=%s route_base=%s route_app=%s\n" "$slug" "$direct_code" "$route_base_code" "$route_app_code"
  else
    fail=$((fail + 1))
    if [[ "$GATEWAY_ONLY" -eq 1 ]]; then
      printf "FAIL %-24s route_base=%s route_app=%s\n" "$slug" "$route_base_code" "$route_app_code"
    else
      printf "FAIL %-24s direct=%s route_base=%s route_app=%s\n" "$slug" "$direct_code" "$route_base_code" "$route_app_code"
    fi
  fi
done < apps-manifests/apps.tsv

echo
echo "Summary"
echo "-------"
echo "Total: $total"
echo "OK: $ok"
echo "Fail: $fail"

if [[ "$fail" -gt 0 ]]; then
  exit 1
fi
