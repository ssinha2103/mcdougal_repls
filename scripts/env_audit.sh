#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

STRICT=0
if [[ "${1:-}" == "--strict" ]]; then
  STRICT=1
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--strict]"
  exit 1
fi

ENV_FILES="$(
  find env -maxdepth 1 -type f -name '*.env' \
    ! -name 'global.env' \
    ! -name 'global.env.example' \
    ! -name 'credentials.request.env' \
    | sort
)"
if [[ -z "$ENV_FILES" ]]; then
  echo "No app env files found in env/*.env"
  exit 1
fi

TMP_OUT="$(mktemp)"

# shellcheck disable=SC2086
set +e
awk -v strict="$STRICT" '
BEGIN {
  FS="="
  print "Env Audit"
  print "---------"
}

FNR == 1 {
  app = FILENAME
  sub(/^env\//, "", app)
  sub(/\.env$/, "", app)
  apps[app] = 1
}

/^[[:space:]]*#/ || /^[[:space:]]*$/ { next }

$1 ~ /^[A-Z0-9_]+$/ {
  key = $1
  val = substr($0, index($0, "=") + 1)
  sub(/\r$/, "", val)

  if (val == "") {
    if (!(app SUBSEP key in missingSeen)) {
      missingSeen[app SUBSEP key] = 1
      missing[app] = missing[app] ((missing[app] == "") ? "" : ",") key
      missingCount[app]++
      keyMissingApps[key] = keyMissingApps[key] ((keyMissingApps[key] == "") ? "" : ",") app
      missingTotal++
    }
  } else if (val ~ /^local-dev-placeholder/ || val == "replace-with-a-long-random-secret" || val == "local-dev-bucket") {
    if (!(app SUBSEP key in placeholderSeen)) {
      placeholderSeen[app SUBSEP key] = 1
      placeholder[app] = placeholder[app] ((placeholder[app] == "") ? "" : ",") key
      placeholderCount[app]++
      keyPlaceholderApps[key] = keyPlaceholderApps[key] ((keyPlaceholderApps[key] == "") ? "" : ",") app
      placeholderTotal++
    }
  }
}

END {
  printf "%-26s %-8s %-12s\n", "app", "missing", "placeholder"
  for (app in apps) {
    printf "%-26s %-8d %-12d\n", app, missingCount[app] + 0, placeholderCount[app] + 0
  }

  print ""
  print "Missing Keys By App"
  print "-------------------"
  anyMissing = 0
  for (app in apps) {
    if (missingCount[app] > 0) {
      anyMissing = 1
      printf "- %s: %s\n", app, missing[app]
    }
  }
  if (!anyMissing) {
    print "- none"
  }

  print ""
  print "Placeholder Keys By App"
  print "-----------------------"
  anyPlaceholder = 0
  for (app in apps) {
    if (placeholderCount[app] > 0) {
      anyPlaceholder = 1
      printf "- %s: %s\n", app, placeholder[app]
    }
  }
  if (!anyPlaceholder) {
    print "- none"
  }

  print ""
  printf "Totals: missing=%d placeholder=%d\n", missingTotal + 0, placeholderTotal + 0

  if (missingTotal > 0 || (strict == 1 && placeholderTotal > 0)) {
    exit 2
  }
}
' $ENV_FILES > "$TMP_OUT"
status=$?
set -e
cat "$TMP_OUT"
rm -f "$TMP_OUT"

if [[ "$status" -eq 2 ]]; then
  if [[ "$STRICT" -eq 1 ]]; then
    echo
    echo "Audit failed: missing and/or placeholder values detected (strict mode)."
  else
    echo
    echo "Audit failed: missing values detected."
  fi
  exit 1
fi

echo
if [[ "$STRICT" -eq 1 ]]; then
  echo "Audit passed (strict)."
else
  echo "Audit passed (non-strict)."
fi
