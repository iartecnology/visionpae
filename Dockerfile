FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl bash
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:9080}
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter=engine build && pnpm --filter=shared build && \
    cd apps/api && pnpm db:generate && \
    pnpm run --filter=api --filter=web --filter=worker --filter=mobile-sync --parallel build

ENV NODE_ENV=production

EXPOSE 8080 3001

COPY proxy.js docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
