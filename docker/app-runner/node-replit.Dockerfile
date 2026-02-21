# syntax=docker/dockerfile:1.7
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json* ./

RUN --mount=type=cache,target=/root/.npm \
  if [ -f package-lock.json ]; then \
    npm ci --prefer-offline --no-audit --no-fund || npm install --prefer-offline --no-audit --no-fund; \
  else \
    npm install --prefer-offline --no-audit --no-fund; \
  fi

COPY . ./

ENV NODE_ENV=production
ENV PORT=5000

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
