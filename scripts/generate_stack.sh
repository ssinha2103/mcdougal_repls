#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APPS_DIR="apps"
MANIFEST_TSV="apps-manifests/apps.tsv"
TOOLS_MAP_JSON="apps-manifests/tools-map.json"
ENV_MATRIX_MD="apps-manifests/env-matrix.md"
COMPOSE_FILE="docker-compose.yml"
PROD_COMPOSE_FILE="docker-compose.prod.yml"
NGINX_CONF="docker/home/default.conf"
CADDYFILE="docker/caddy/Caddyfile"
HOME_HTML="docker/home/home.html"
GLOBAL_ENV_FILE="env/global.env"
GLOBAL_ENV_EXAMPLE_FILE="env/global.env.example"

mkdir -p apps-manifests docker/home docker/caddy env

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

have_rg() {
  command -v rg >/dev/null 2>&1
}

filter_reserved_env_keys() {
  if have_rg; then
    rg -v '^(NODE_ENV|PORT|REPL_ID|REPL_SLUG|REPLIT_DEPLOYMENT|REPL_DEPLOYMENT|REPLIT_DEV_DOMAIN|REPLIT_INTERNAL_APP_DOMAIN)$' || true
  else
    grep -Ev '^(NODE_ENV|PORT|REPL_ID|REPL_SLUG|REPLIT_DEPLOYMENT|REPL_DEPLOYMENT|REPLIT_DEV_DOMAIN|REPLIT_INTERNAL_APP_DOMAIN)$' || true
  fi
}

find_last_key_line() {
  local file="$1"
  local key="$2"
  if have_rg; then
    rg --no-filename "^${key}=" "$file" | tail -n1 || true
  else
    grep -E "^${key}=" "$file" | tail -n1 || true
  fi
}

collect_env_keys() {
  local dir="$1"
  if have_rg; then
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
    } | filter_reserved_env_keys | sort -u || true
  else
    {
      while IFS= read -r file; do
        grep -aEo "process\\.env\\.[A-Z0-9_]+" "$file" 2>/dev/null | sed -E 's/.*\.//' || true
        grep -aEo "process\\.env\\[['\"][A-Z0-9_]+['\"]\\]" "$file" 2>/dev/null | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
        grep -aEo "os\\.getenv\\(['\"][A-Z0-9_]+['\"]" "$file" 2>/dev/null | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
        grep -aEo "os\\.environ\\.get\\(['\"][A-Z0-9_]+['\"]" "$file" 2>/dev/null | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
        grep -aEo "os\\.environ\\[['\"][A-Z0-9_]+['\"]\\]" "$file" 2>/dev/null | sed -E "s/.*['\"]([A-Z0-9_]+)['\"].*/\\1/" || true
      done < <(
        find "$dir" \
          \( -type d \( -name node_modules -o -name dist -o -name build -o -name attached_assets -o -name .git -o -name .venv -o -name venv \) -prune \) -o \
          -type f -print
      )
    } | filter_reserved_env_keys | sort -u || true
  fi
}

is_placeholder_value() {
  local value="$1"
  [[ "$value" == local-dev-placeholder* || "$value" == "replace-with-a-long-random-secret" || "$value" == "local-dev-bucket" ]]
}

default_env_value() {
  local key="$1"
  case "$key" in
    DATABASE_URL)
      echo "postgresql://postgres:postgres@postgres:5432/mcdougal_tools"
      ;;
    SESSION_SECRET)
      echo "replace-with-a-long-random-secret"
      ;;
    DATAFORSEO_LOGIN)
      echo "local-dev-placeholder-login"
      ;;
    DATAFORSEO_PASSWORD)
      echo "local-dev-placeholder-password"
      ;;
    GCS_BUCKET_NAME)
      echo "local-dev-bucket"
      ;;
    DOMAIN)
      echo "leadshub.live"
      ;;
    ACME_EMAIL)
      echo "admin@leadshub.live"
      ;;
    FRAME_ANCESTORS)
      echo "*"
      ;;
    *)
      echo ""
      ;;
  esac
}

lookup_existing_value() {
  local key="$1"
  local global_value=""

  if [[ -f "$GLOBAL_ENV_FILE" ]]; then
    local global_line
    global_line="$(find_last_key_line "$GLOBAL_ENV_FILE" "$key")"
    if [[ -n "$global_line" ]]; then
      global_value="${global_line#*=}"
    fi
  fi

  if [[ -n "$global_value" ]] && ! is_placeholder_value "$global_value"; then
    echo "$global_value"
    return
  fi

  local fallback="$global_value"
  local app_env
  for app_env in env/*.env; do
    [[ -f "$app_env" ]] || continue
    case "$(basename "$app_env")" in
      global.env|global.env.example|credentials.request.env)
        continue
        ;;
    esac

    local app_line
    app_line="$(find_last_key_line "$app_env" "$key")"
    [[ -n "$app_line" ]] || continue

    local app_value="${app_line#*=}"
    [[ -n "$app_value" ]] || continue

    if ! is_placeholder_value "$app_value"; then
      echo "$app_value"
      return
    fi

    if [[ -z "$fallback" ]]; then
      fallback="$app_value"
    fi
  done

  if [[ -n "$fallback" ]]; then
    echo "$fallback"
    return
  fi

  default_env_value "$key"
}

write_global_env_file() {
  local out_file="$1"
  local sorted_keys_file="$2"
  local include_existing_values="${3:-true}"

  {
    echo "# Central credentials file for all apps"
    echo "# Generated by scripts/generate_stack.sh"
    echo ""

    if [[ -s "$sorted_keys_file" ]]; then
      while IFS= read -r key; do
        [[ -n "$key" ]] || continue
        local value
        if [[ "$include_existing_values" == "true" ]]; then
          value="$(lookup_existing_value "$key")"
        else
          value="$(default_env_value "$key")"
        fi
        echo "$key=$value"
      done < "$sorted_keys_file"
    fi
  } > "$out_file"
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

# Generate JSON map for tool slug <-> URL <-> service.
cat > "$TOOLS_MAP_JSON" <<'JSON'
{
  "version": 1,
  "domainEnvKey": "DOMAIN",
  "homeSlug": "free-seo-tools-page",
  "tools": [
JSON

first_tool=true
while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  if [[ "$first_tool" == "true" ]]; then
    first_tool=false
  else
    echo "," >> "$TOOLS_MAP_JSON"
  fi

  cat >> "$TOOLS_MAP_JSON" <<JSON
    {
      "slug": "$slug",
      "service": "$slug",
      "path": "/$slug/",
      "publicUrlTemplate": "https://{DOMAIN}/$slug/",
      "localUrl": "http://localhost:$host_port/",
      "internalPort": $internal_port,
      "localPort": $host_port
    }
JSON
done < "$MANIFEST_TSV"

cat >> "$TOOLS_MAP_JSON" <<'JSON'
  ]
}
JSON

# Generate docker-compose.yml
cat > "$COMPOSE_FILE" <<'YAML'
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
      context: ./apps/$slug
      dockerfile: ../../docker/app-runner/node-replit.Dockerfile
    environment:
      NODE_ENV: production
      PORT: "$internal_port"
    env_file:
      - env/global.env
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
      context: ./apps/$slug
      dockerfile: ../../docker/app-runner/python-fastapi.Dockerfile
    environment:
      PORT: "$internal_port"
    env_file:
      - env/global.env
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
      context: ./apps/$slug
      dockerfile: ../../docker/app-runner/python-node-hybrid.Dockerfile
    environment:
      PORT: "$internal_port"
    env_file:
      - env/global.env
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
  gateway:
    ports: !reset []

  postgres:
    ports: !reset []

  caddy:
    image: caddy:2.8-alpine
    env_file:
      - env/global.env
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - gateway
    restart: unless-stopped
YAML

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  cat >> "$PROD_COMPOSE_FILE" <<YAML

  $slug:
    ports: !reset []
YAML
done < "$MANIFEST_TSV"

cat >> "$PROD_COMPOSE_FILE" <<'YAML'

volumes:
  caddy_data:
  caddy_config:
YAML

# Generate nginx gateway config.
cat > "$NGINX_CONF" <<'NGINX'
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}

map $http_x_forwarded_proto $proxy_forwarded_proto {
  default $http_x_forwarded_proto;
  '' $scheme;
}

map $http_x_forwarded_port $proxy_forwarded_port {
  default $http_x_forwarded_port;
  '' $server_port;
}

map $http_referer $referer_tool_upstream {
  default free-seo-tools-page:5000;
NGINX

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  cat >> "$NGINX_CONF" <<NGINX
  ~*^https?://[^/]+/$slug(?:/|$) $slug:$internal_port;
NGINX
done < "$MANIFEST_TSV"

cat >> "$NGINX_CONF" <<'NGINX'
}

server {
  listen 80;
  server_name _;

  charset utf-8;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $proxy_forwarded_proto;
  proxy_set_header X-Forwarded-Host $host;
  proxy_set_header X-Forwarded-Port $proxy_forwarded_port;
  proxy_read_timeout 120s;
  proxy_hide_header X-Frame-Options;
  proxy_hide_header Content-Security-Policy;
  add_header Content-Security-Policy "frame-ancestors *" always;

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

  # Tools are mounted under /<slug>/, but many emit root-relative /assets/* and /api/*.
  # Route those root requests to the tool indicated by Referer.
  location ~* ^/(assets/|api(?:/|$)|socket\.io/|@vite/|vite\.svg$|favicon\.ico$|manifest\.json$|robots\.txt$|[^/]+\.(?:js|css|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)$) {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_pass http://$referer_tool_upstream;
  }
NGINX

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  cat >> "$NGINX_CONF" <<NGINX

  location = /$slug {
    return 302 \$scheme://\$host/$slug/;
  }

  location ^~ /$slug/ {
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \$connection_upgrade;
    rewrite ^/$slug/(.*)\$ /\$1 break;
    proxy_pass http://$slug:$internal_port;
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

# Generate Caddy config for public domain TLS + reverse proxy.
cat > "$CADDYFILE" <<'CADDY'
{
  email {$ACME_EMAIL}
  auto_https disable_redirects
  # Keep HTTP/3 (QUIC) disabled to avoid client-side QUIC protocol errors.
  servers {
    protocols h1 h2
  }
}

http://{$DOMAIN} {
  redir https://{$DOMAIN}{uri} 308
}

http://www.{$DOMAIN} {
  redir https://{$DOMAIN}{uri} 308
}

{$DOMAIN} {
  encode gzip zstd
  reverse_proxy gateway:80 {
    header_up X-Forwarded-Proto https
    header_up X-Forwarded-Port 443
    header_down -X-Frame-Options
    header_down -Content-Security-Policy
  }
  header {
    Content-Security-Policy "frame-ancestors {$FRAME_ANCESTORS}"
  }
}

http://149.56.131.161 {
  encode gzip zstd
  reverse_proxy gateway:80 {
    header_up X-Forwarded-Proto http
    header_up X-Forwarded-Port 80
    header_down -X-Frame-Options
    header_down -Content-Security-Policy
  }
  header {
    Content-Security-Policy "frame-ancestors {$FRAME_ANCESTORS}"
  }
}

www.{$DOMAIN} {
  redir https://{$DOMAIN}{uri} 308
}
CADDY

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
        <p class="meta">env file: <code>env/global.env</code></p>
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

# Generate env matrix + centralized env files.
cat > "$ENV_MATRIX_MD" <<'MD'
# Environment Variable Matrix

Each app reads from a single file: `env/global.env`.

| App | Keys |
|---|---|
MD

all_keys_file="$(mktemp)"
all_keys_sorted_file="$(mktemp)"
cleanup() {
  rm -f "$all_keys_file" "$all_keys_sorted_file"
}
trap cleanup EXIT

while IFS=$'\t' read -r slug type host_port internal_port; do
  if [[ "$type" == "unsupported" ]]; then
    continue
  fi

  keys="$(collect_env_keys "$APPS_DIR/$slug")"
  if [[ -n "$keys" ]]; then
    echo "$keys" >> "$all_keys_file"
    key_line="$(echo "$keys" | tr '\n' ',' | sed 's/,$//')"
  else
    key_line="(none detected)"
  fi

  printf "| %s | %s |\n" "$slug" "$key_line" >> "$ENV_MATRIX_MD"
done < "$MANIFEST_TSV"

if [[ -s "$all_keys_file" ]]; then
  sort -u "$all_keys_file" > "$all_keys_sorted_file"
else
  : > "$all_keys_sorted_file"
fi

for required_key in DOMAIN ACME_EMAIL FRAME_ANCESTORS; do
  echo "$required_key" >> "$all_keys_sorted_file"
done
sort -u "$all_keys_sorted_file" -o "$all_keys_sorted_file"

write_global_env_file "$GLOBAL_ENV_EXAMPLE_FILE" "$all_keys_sorted_file" "false"
if [[ -f "$GLOBAL_ENV_FILE" ]]; then
  write_global_env_file "$GLOBAL_ENV_FILE" "$all_keys_sorted_file" "true"
else
  cp "$GLOBAL_ENV_EXAMPLE_FILE" "$GLOBAL_ENV_FILE"
fi

echo "Generated: $COMPOSE_FILE"
echo "Generated: $PROD_COMPOSE_FILE"
echo "Generated: $NGINX_CONF"
echo "Generated: $CADDYFILE"
echo "Generated: $HOME_HTML"
echo "Generated: $MANIFEST_TSV"
echo "Generated: $TOOLS_MAP_JSON"
echo "Generated: $ENV_MATRIX_MD"
echo "Generated: $GLOBAL_ENV_EXAMPLE_FILE"
echo "Ready to edit: $GLOBAL_ENV_FILE"
