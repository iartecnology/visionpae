FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl bash
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/ packages/
COPY apps/ apps/

RUN pnpm install --frozen-lockfile

RUN cd packages/engine && pnpm build && cd /app && \
    cd packages/shared && pnpm build && cd /app && \
    cd apps/api && pnpm db:generate && pnpm build && cd /app && \
    pnpm --filter web build && \
    pnpm --filter worker build && \
    pnpm --filter mobile-sync build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000 3001 3002

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
