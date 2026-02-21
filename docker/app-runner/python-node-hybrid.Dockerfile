FROM node:20-bookworm-slim AS frontend-build

ARG APP_DIR
WORKDIR /src

COPY ${APP_DIR}/frontend/package.json ./frontend/
COPY ${APP_DIR}/frontend/package-lock.json* ./frontend/

RUN cd frontend && if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

COPY ${APP_DIR}/frontend ./frontend
RUN cd frontend && npm run build

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG APP_DIR
COPY ${APP_DIR}/pyproject.toml /tmp/pyproject.toml

RUN python - <<'PY'
import subprocess
import sys
import tomllib

with open('/tmp/pyproject.toml', 'rb') as f:
    deps = tomllib.load(f).get('project', {}).get('dependencies', [])

if deps:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--no-cache-dir', *deps])
PY

COPY ${APP_DIR}/ ./
COPY --from=frontend-build /src/frontend/dist /app/frontend/dist

EXPOSE 3000

CMD ["sh", "-lc", "python backend/main.py"]
