#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APPS_DIR="apps"
MANIFEST_TSV="apps-manifests/apps.tsv"
ENV_MATRIX_MD="apps-manifests/env-matrix.md"
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
NGINX_CONF="docker/home/default.conf"
HOME_HTML="docker/home/home.html"

mkdir -p apps-manifests docker/home env

# POSIX-compatible uppercase title conversion for simple slug labels.
titleize_slug() {
  local slug="$1"
  echo "$slug" | sed -E 's/-/ /g' | awk '{
    for (i=1; i<=NF; i++) {
      $i=toupper(substr($i,1,1)) substr($i,2)
    }
    print
  }'
}

collect_env_keys() {
  local dir="$1"
  {
    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "process\\.env\\.[A-Z0-9_]+" "$dir" 2>/dev/null | sed -E 's/.*\.//' || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "process\\.env\\[['\"][A-Z0-9_]+['\"]\\]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.getenv\\(['\"][A-Z0-9_]+['\"]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.environ\\.get\\(['\"][A-Z0-9_]+['\"]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true

    rg -o --no-filename \
      -g '!**/node_modules/**' \
      -g '!**/dist/**' \
      -g '!**/build/**' \
      -g '!**/attached_assets/**' \
      -g '!**/.git/**' \
      -g '!**/.venv/**' \
      -g '!**/venv/**' \
      "os\\.environ\\[['\"][A-Z0-9_]+['\"]\\]" "$dir" 2>/dev/null \
      | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
  } \
    | rg -v '^(NODE_ENV|PORT|REPL_ID|REPL_SLUG|REPLIT_DEPLOYMENT|REPL_DEPLOYMENT|REPLIT_DEV_DOMAIN|REPLIT_INTERNAL_APP_DOMAIN)$' \
    | sort -u || true
}

# Build manifest
: > "$MANIFEST_TSV"
port=8101
while IFS= read -r app_dir; do
  slug="$(basename "$app_dir")"
  type=""
  internal_port=""

  if [[ -f "$app_dir/backend/app.py" && -f "$app_dir/frontend/package.json" ]]; then
    type="python_node_hybrid"
    internal_port="3000"
  elif [[ -f "$app_dir/package.json" ]]; then
    type="node_replit"
    internal_port="5000"
  elif [[ -f "$app_dir/app/main.py" && -f "$app_dir/pyproject.toml" ]]; then
    type="python_fastapi"
    internal_port="5000"
  else
    type="unsupported"
    internal_port=""
  fi

  printf "%s\t%s\t%s\t%s\n" "$slug" "$type" "$port" "$internal_port" >> "$MANIFEST_TSV"

  if [[ "$type" != "unsupported" ]]; then
    port=$((port + 1))
  fi
done < <(find "$APPS_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

# Generate docker-compose.yml
cat > "$COMPOSE_FILE" <<'YAML'
name: mcdougal-local-suite

services:
  gateway:
    image: nginx:1.27-alpine
    ports:
      - "8000:80"
    volumes:
      - ./docker/home/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./docker/home/home.html:/usr/share/nginx/html/home.html:ro
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: mcdougal_tools
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
YAML

while IFS=$'\t' read -r slug type host_port internal_port; do
  case "$type" in
    node_replit)
      cat >> "$COMPOSE_FILE" <<YAML

  $slug:
    build:
      context: .
      dockerfile: docker/app-runner/node-replit.Dockerfile
      args:
        APP_DIR: apps/$slug
    environment:
      NODE_ENV: production
      PORT: "$internal_port"
    env_file:
      - env/$slug.env
    depends_on:
      - postgres
    ports:
      - "$host_port:$internal_port"
    restart: unless-stopped
YAML
      ;;
    python_fastapi)
      cat >> "$COMPOSE_FILE" <<YAML

  $slug:
    build:
      context: .
      dockerfile: docker/app-runner/python-fastapi.Dockerfile
      args:
        APP_DIR: apps/$slug
    environment:
      PORT: "$internal_port"
    env_file:
      - env/$slug.env
    depends_on:
      - postgres
    ports:
      - "$host_port:$internal_port"
    restart: unless-stopped
YAML
      ;;
    python_node_hybrid)
      cat >> "$COMPOSE_FILE" <<YAML

  $slug:
    build:
      context: .
      dockerfile: docker/app-runner/python-node-hybrid.Dockerfile
      args:
        APP_DIR: apps/$slug
    environment:
      PORT: "$internal_port"
    env_file:
      - env/$slug.env
    depends_on:
      - postgres
    ports:
      - "$host_port:$internal_port"
    restart: unless-stopped
YAML
      ;;
  esac
done < "$MANIFEST_TSV"

cat >> "$COMPOSE_FILE" <<'YAML'

volumes:
  postgres_data:
YAML

# Generate production override compose (gateway-only exposure).
cat > "$PROD_COMPOSE_FILE" <<'YAML'
services:
  postgres:
    ports: []
YAML

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  cat >> "$PROD_COMPOSE_FILE" <<YAML

  $slug:
    ports: []
YAML
done < "$MANIFEST_TSV"

# Generate nginx gateway config.
cat > "$NGINX_CONF" <<'NGINX'
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

server {
  listen 80;
  server_name _;

  charset utf-8;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $server_port;
  proxy_read_timeout 120s;

  location = /healthz {
    default_type text/plain;
    return 200 "ok\n";
  }

  # Use free-seo-tools-page as the default home UI.
  location = / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_pass http://free-seo-tools-page:5000/;
  }
NGINX

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  cat >> "$NGINX_CONF" <<NGINX

  location = /$slug {
    return 302 \$scheme://\$host:$host_port/;
  }

  location ~ ^/$slug/(.*)\$ {
    return 302 \$scheme://\$host:$host_port/\$1\$is_args\$args;
  }
NGINX
done < "$MANIFEST_TSV"

cat >> "$NGINX_CONF" <<'NGINX'

  location / {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_pass http://free-seo-tools-page:5000;
  }
}
NGINX

# Generate home page.
cat > "$HOME_HTML" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Local Free SEO Tools</title>
    <style>
      :root {
        --bg: #f4f7fb;
        --panel: #ffffff;
        --ink: #122139;
        --muted: #5c6d87;
        --accent: #0a7a5f;
        --accent-2: #0d4f8b;
        --border: #d8e1ed;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at 10% 15%, #d7e8ff 0%, transparent 35%),
          radial-gradient(circle at 90% 0%, #d4f6ef 0%, transparent 32%),
          var(--bg);
      }
      header {
        padding: 32px 20px 20px;
        max-width: 1280px;
        margin: 0 auto;
      }
      h1 {
        margin: 0;
        font-size: clamp(1.6rem, 2.8vw, 2.5rem);
        letter-spacing: 0.01em;
      }
      p { margin: 8px 0 0; color: var(--muted); }
      .grid {
        max-width: 1280px;
        margin: 0 auto;
        padding: 16px 20px 36px;
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
      .card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        display: grid;
        gap: 10px;
        box-shadow: 0 6px 20px rgba(14, 40, 74, 0.06);
      }
      .title {
        font-size: 1rem;
        margin: 0;
      }
      .meta {
        font-size: 0.82rem;
        color: var(--muted);
        margin: 0;
      }
      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      a {
        text-decoration: none;
        text-align: center;
        border-radius: 10px;
        padding: 8px 10px;
        font-size: 0.86rem;
        border: 1px solid transparent;
      }
      .shortcut {
        background: var(--accent-2);
        color: #fff;
      }
      .direct {
        background: #fff;
        border-color: var(--border);
        color: var(--ink);
      }
      footer {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 20px 28px;
        color: var(--muted);
        font-size: 0.84rem;
      }
      code {
        background: #edf3fc;
        padding: 2px 6px;
        border-radius: 6px;
      }
    </style>
  </head>
  <body>
    <header>
      <h1>Local Free SEO Tools</h1>
      <p>One Dockerized launcher for all extracted tools. Use <code>localhost:8000/&lt;tool-slug&gt;/</code> for quick routing.</p>
    </header>
    <main class="grid">
HTML

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    title="$(titleize_slug "$slug")"
    cat >> "$HOME_HTML" <<HTML
      <section class="card">
        <h2 class="title">$title</h2>
        <p class="meta">$slug</p>
        <p class="meta">Unsupported project type. Add custom Docker config for this repo.</p>
      </section>
HTML
    continue
  fi

  title="$(titleize_slug "$slug")"
  cat >> "$HOME_HTML" <<HTML
      <section class="card">
        <h2 class="title">$title</h2>
        <p class="meta">slug: <code>$slug</code></p>
        <p class="meta">type: <code>$type</code></p>
        <p class="meta">env file: <code>env/$slug.env</code></p>
        <div class="actions">
          <a class="shortcut" href="/$slug/">Open via 8000 URL</a>
          <a class="direct" href="http://localhost:$host_port/">Open direct port</a>
        </div>
      </section>
HTML
done < "$MANIFEST_TSV"

cat >> "$HOME_HTML" <<'HTML'
    </main>
    <footer>
      Build/start: <code>docker compose up --build -d</code>. Stop: <code>docker compose down</code>.
    </footer>
  </body>
</html>
HTML

# Generate env templates + matrix markdown.
cat > "$ENV_MATRIX_MD" <<'MD'
# Environment Variable Matrix

Fill each `env/<slug>.env` file with the keys below.

| App | Keys |
|---|---|
MD

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  keys="$(collect_env_keys "$APPS_DIR/$slug")"

  env_file="env/$slug.env"
  existing_env_file="${env_file}.existing"
  if [[ -f "$env_file" ]]; then
    cp "$env_file" "$existing_env_file"
  else
    : > "$existing_env_file"
  fi

  {
    echo "# Environment values for $slug"
    echo "# Generated by scripts/generate_stack.sh"
    if [[ -n "$keys" ]]; then
      while IFS= read -r key; do
        [[ -n "$key" ]] || continue
        existing_value="$( (rg -n "^${key}=" "$existing_env_file" || true) | tail -n1 | sed -E 's/^[^=]+=//' )"
        if [[ -n "$existing_value" ]]; then
          echo "$key=$existing_value"
        elif [[ "$key" == "DATABASE_URL" ]]; then
          echo "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mcdougal_tools"
        elif [[ "$key" == "SESSION_SECRET" ]]; then
          echo "SESSION_SECRET=replace-with-a-long-random-secret"
        elif [[ "$key" == "DATAFORSEO_LOGIN" ]]; then
          echo "DATAFORSEO_LOGIN=local-dev-placeholder-login"
        elif [[ "$key" == "DATAFORSEO_PASSWORD" ]]; then
          echo "DATAFORSEO_PASSWORD=local-dev-placeholder-password"
        elif [[ "$key" == "GCS_BUCKET_NAME" ]]; then
          echo "GCS_BUCKET_NAME=local-dev-bucket"
        else
          echo "$key="
        fi
      done <<< "$keys"
    else
      echo "# No required env keys auto-detected in source."
    fi
  } > "$env_file"
  rm -f "$existing_env_file"

  if [[ -n "$keys" ]]; then
    key_line="$(echo "$keys" | tr '\n' ',' | sed 's/,$//')"
  else
    key_line="(none detected)"
  fi

  printf "| %s | %s |\n" "$slug" "$key_line" >> "$ENV_MATRIX_MD"
done < "$MANIFEST_TSV"

echo "Generated: $COMPOSE_FILE"
echo "Generated: $PROD_COMPOSE_FILE"
echo "Generated: $NGINX_CONF"
echo "Generated: $HOME_HTML"
echo "Generated: $MANIFEST_TSV"
echo "Generated: $ENV_MATRIX_MD"
