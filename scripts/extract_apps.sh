#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p apps

slugify() {
  local input="$1"
  echo "$input" \
    | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//; s/-+/-/g'
}

extract_zip() {
  local zip_file="$1"
  local base
  base="$(basename "$zip_file" .zip)"
  base="${base#mcdougall-interactive-}"
  local slug
  slug="$(slugify "$base")"
  local target_dir="apps/$slug"

  if [[ -d "$target_dir" ]]; then
    echo "skip: $zip_file -> $target_dir (already exists)"
    return
  fi

  local tmpdir
  tmpdir="$(mktemp -d)"
  unzip -q "$zip_file" -d "$tmpdir"

  roots=()
  while IFS= read -r root; do
    roots+=("$root")
  done < <(zipinfo -1 "$zip_file" | awk -F/ 'NF {print $1}' | sort -u)

  mkdir -p "$target_dir"
  if [[ "${#roots[@]}" -eq 1 && -d "$tmpdir/${roots[0]}" ]]; then
    shopt -s dotglob nullglob
    mv "$tmpdir/${roots[0]}"/* "$target_dir"/ || true
    shopt -u dotglob nullglob
  else
    shopt -s dotglob nullglob
    mv "$tmpdir"/* "$target_dir"/ || true
    shopt -u dotglob nullglob
  fi

  rm -rf "$tmpdir"

  # Remove noisy build/dev artifacts from Replit exports.
  find "$target_dir" -type d \( \
    -name .git -o \
    -name node_modules -o \
    -name .config -o \
    -name .cache -o \
    -name .local -o \
    -name __pycache__ \
  \) -prune -exec rm -rf {} +

  find "$target_dir" -name '.DS_Store' -delete

  echo "ok: $zip_file -> $target_dir"
}

for zip in mcdougall-interactive-*.zip; do
  [[ -e "$zip" ]] || continue
  extract_zip "$zip"
done

# Include already-unzipped local project if present.
if [[ -d "aiseopagescore" && ! -d "apps/ai-seo-pagescore" ]]; then
  mkdir -p "apps/ai-seo-pagescore"
  rsync -a --exclude '.git' --exclude 'node_modules' --exclude '.config' --exclude '.cache' --exclude '.local' \
    "aiseopagescore/" "apps/ai-seo-pagescore/"
  echo "ok: copied aiseopagescore -> apps/ai-seo-pagescore"
fi
