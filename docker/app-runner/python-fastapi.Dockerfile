# syntax=docker/dockerfile:1.7
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

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

EXPOSE 5000

CMD ["sh", "-lc", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-5000}"]
