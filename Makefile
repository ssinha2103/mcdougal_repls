.PHONY: bootstrap up up-prod down restart status logs smoke smoke-gateway regen env audit audit-strict creds finalize reload-gateway setup-gcp

bootstrap:
	./scripts/bootstrap.sh

up:
	docker compose up -d

up-prod:
	./scripts/up_prod_mode.sh

down:
	docker compose down

restart:
	docker compose down && docker compose up -d

status:
	./scripts/stack_status.sh

logs:
	docker compose logs -f

smoke:
	./scripts/smoke_test.sh

smoke-gateway:
	./scripts/smoke_test.sh --gateway-only

regen:
	./scripts/generate_stack.sh

reload-gateway:
	./scripts/reload_gateway.sh

env:
	./scripts/generate_global_env.sh
	@echo "Edit env/global.env (single env file for all apps)."

audit:
	./scripts/env_audit.sh

audit-strict:
	./scripts/env_audit.sh --strict

creds:
	./scripts/generate_credentials_request.sh
	@echo "Fill env/credentials.request.env, then run: ./scripts/apply_global_env.sh env/credentials.request.env"

finalize:
	./scripts/finalize_credentials.sh

setup-gcp:
	./scripts/install_gcp_requirements.sh
