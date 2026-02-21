FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ARG APP_DIR
COPY ${APP_DIR}/package.json ./
COPY ${APP_DIR}/package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi

COPY ${APP_DIR}/ ./

ENV NODE_ENV=production
ENV PORT=5000

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "start"]
