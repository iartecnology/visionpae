FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY packages/ packages/

FROM base AS deps
RUN pnpm install --frozen-lockfile
RUN cd packages/engine && pnpm build && cd /app && \
    cd packages/shared && pnpm build && cd /app

FROM deps AS api-build
COPY apps/api/ apps/api/
RUN cd apps/api && pnpm db:generate && pnpm build && cd /app
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main"]

FROM base AS web-deps
RUN pnpm install --frozen-lockfile
COPY apps/web/ apps/web/
ENV NEXT_TELEMETRY_DISABLED=1

FROM web-deps AS web-build
RUN pnpm --filter web build

FROM node:20-alpine AS web-runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
WORKDIR /app
COPY --from=web-build /app/apps/web/public ./public
COPY --from=web-build /app/apps/web/.next/standalone ./
COPY --from=web-build /app/apps/web/.next/static ./.next/static
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
CMD ["node", "server.js"]

FROM deps AS worker-build
COPY apps/worker/ apps/worker/
RUN pnpm --filter worker build
EXPOSE 3002
ENV NODE_ENV=production
CMD ["node", "apps/worker/dist/main.js"]

FROM deps AS mobile-sync-build
COPY apps/mobile-sync/ apps/mobile-sync/
RUN pnpm --filter mobile-sync build
ENV NODE_ENV=production
CMD ["node", "apps/mobile-sync/dist/main.js"]
