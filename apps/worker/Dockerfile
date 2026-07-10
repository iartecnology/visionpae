FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ packages/
COPY apps/worker/ apps/worker/

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY . .
RUN pnpm --filter worker build
CMD ["node", "apps/worker/dist/main.js"]
