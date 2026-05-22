# syntax=docker/dockerfile:1

FROM node:22-slim AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /app

COPY . .
RUN pnpm run build

FROM deps AS migrate
WORKDIR /app

COPY . .
CMD ["pnpm", "exec", "drizzle-kit", "migrate"]

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY patches ./patches
RUN pnpm install --prod --frozen-lockfile && pnpm store prune

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]
