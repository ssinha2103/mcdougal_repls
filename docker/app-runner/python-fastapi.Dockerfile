FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=5000

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

EXPOSE 5000

CMD ["sh", "-lc", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-5000}"]
