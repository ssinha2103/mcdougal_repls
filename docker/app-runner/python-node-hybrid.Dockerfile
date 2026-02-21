# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim AS frontend-build

WORKDIR /src

COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json* ./frontend/

RUN --mount=type=cache,target=/root/.npm \
  cd frontend && if [ -f package-lock.json ]; then npm ci --prefer-offline --no-audit --no-fund || npm install --prefer-offline --no-audit --no-fund; else npm install --prefer-offline --no-audit --no-fund; fi

COPY frontend ./frontend
RUN --mount=type=cache,target=/root/.npm cd frontend && npm run build

FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=3000

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /tmp/pyproject.toml

RUN --mount=type=cache,target=/root/.cache/pip python - <<'PY'
import subprocess
import sys
import tomllib

with open('/tmp/pyproject.toml', 'rb') as f:
    deps = tomllib.load(f).get('project', {}).get('dependencies', [])

if deps:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', '--prefer-binary', *deps])
PY

COPY . ./
COPY --from=frontend-build /src/frontend/dist /app/frontend/dist

EXPOSE 3000

CMD ["sh", "-lc", "python backend/main.py"]
