# Local Multi-Repo Docker Stack

This workspace can run all extracted tools locally with:

- Home screen (`free-seo-tools-page` UI): `http://localhost:8000`
- Shortcut URLs (redirect to app ports): `http://localhost:8000/<tool-slug>/`
- Direct app URLs: `http://localhost:81xx`
- Production domain mode (TLS via Caddy): `https://<your-domain>/<tool-slug>/`

## Production status

The production stack has been migrated from GCP to OVH and is live on:

- Domain: `leadshub.live`
- OVH public IP: `149.56.131.161`
- Runtime path: `/opt/mcdougal_repls` on the OVH host
- HTTPS: Caddy-managed Let's Encrypt certificates for `leadshub.live` and `www.leadshub.live`

Verified after DNS cutover: `https://leadshub.live/`, `https://leadshub.live/free-seo-tools-page/`, and `https://leadshub.live/ai-seo-pagescore/` return HTTP 200. `www.leadshub.live` redirects to the apex domain.

The old GCP deployment has been decommissioned. The `metal-hope-480717-q5` project no longer has billing enabled, and its former `mcd` Compute Engine VM and attached `mcd` persistent disk have been deleted.

## 0) GCP VM bootstrap (Docker + prerequisites)

On a fresh Debian/Ubuntu GCP VM, run:

```bash
chmod +x ./scripts/install_gcp_requirements.sh
./scripts/install_gcp_requirements.sh
```

Then re-login (or run `newgrp docker`) and continue with `./run.sh up-d`.

If you access from outside the VM and use shortcut URLs, allow inbound TCP:
- `8000`
- `8101-8124`

For production domain mode, allow inbound TCP:
- `80`
- `443`

On an already-built GCP host, deploy latest changes without forced rebuild:

```bash
git pull origin main
./scripts/generate_stack.sh
./run.sh reup
```

For a very fast first boot on small VMs, bring up only the home screen first:

```bash
./run.sh up-core
```

Then build everything later with:

```bash
./run.sh up-d-build
```

## 1) Extract repos into `apps/`

```bash
./scripts/extract_apps.sh
```

This extracts every `mcdougall-interactive-*.zip` into normalized folders under `apps/`.

## 2) Generate stack files

```bash
./scripts/generate_stack.sh
```

This generates:

- `docker-compose.yml`
- `docker-compose.prod.yml`
- `docker/home/default.conf`
- `docker/caddy/Caddyfile`
- `docker/home/home.html`
- `apps-manifests/apps.tsv`
- `apps-manifests/env-matrix.md`
- `env/global.env.example`
- `env/global.env`

## 3) Fill env credentials

Use one file for the full stack:

- `env/global.env`

Reference:

- `apps-manifests/env-matrix.md`

Notes:

- `DATABASE_URL` is prefilled to local Docker Postgres:
  `postgresql://postgres:postgres@postgres:5432/mcdougal_tools`
- Most tools will start with that DB, but API-backed features require their own keys.
- Local placeholders are prefilled for:
  - `DATAFORSEO_LOGIN` / `DATAFORSEO_PASSWORD` (to keep `intent-discover` booting)
  - `GCS_BUCKET_NAME` (to keep `semrush-scraper` booting)
  Replace these with real credentials for full feature behavior.

Regenerate/update global env template from app source:

```bash
./scripts/generate_global_env.sh
```

Edit `env/global.env` once. That file is mounted into every app container.

If you receive a separate credentials file, merge its non-empty values into `env/global.env`:

```bash
./scripts/apply_global_env.sh env/credentials.request.env
```

Generate a focused list of still-missing credentials:

```bash
./scripts/generate_credentials_request.sh
```

After filling that file, apply and verify everything in one go:

```bash
./scripts/finalize_credentials.sh
```

## 4) Start everything

```bash
docker compose up --build -d
```

Gateway-only production mode (single public HTTPS entrypoint):

1) Set your domain in `env/global.env`:

```env
DOMAIN=leadshub.live
ACME_EMAIL=admin@leadshub.live
FRAME_ANCESTORS=*
```

`FRAME_ANCESTORS=*` allows embedding on any WordPress site. Restrict it later by listing specific origins.

2) Point DNS `A` record for the `DOMAIN` value (from `env/global.env`) to your VM public IP.

3) Start production mode:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

or

```bash
./run.sh up-prod
```

4) Embed any tool in WordPress using:

```html
<iframe
  src="https://<your-domain>/ai-seo-pagescore/"
  width="100%"
  height="900"
  style="border:0"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

Recommended for first run (sequential, easier to debug):

```bash
./scripts/start_stack.sh
```

Start only the first N apps (test mode):

```bash
./scripts/start_stack.sh 5
```

## 5) Stop everything

```bash
docker compose down
```

## Useful checks

```bash
docker compose ps
docker compose logs -f <service-name>
./scripts/stack_status.sh
./scripts/smoke_test.sh
./scripts/smoke_test.sh --gateway-only
./scripts/env_audit.sh
./scripts/env_audit.sh --strict
./scripts/generate_credentials_request.sh
./scripts/reload_gateway.sh
```

## One-command workflow

```bash
./scripts/bootstrap.sh
```

Optional test mode (first N apps only):

```bash
./scripts/bootstrap.sh 5
```

Makefile shortcuts:

```bash
make bootstrap
make status
make up-prod
make smoke
make smoke-gateway
make env
make creds
make finalize
make reload-gateway
make down
```
