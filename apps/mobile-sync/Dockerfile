FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ packages/
COPY apps/mobile-sync/ apps/mobile-sync/

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/mobile-sync/node_modules ./apps/mobile-sync/node_modules
COPY . .
RUN pnpm --filter engine build && pnpm --filter mobile-sync build
ENV NODE_ENV=production
CMD ["node", "apps/mobile-sync/dist/main.js"]
