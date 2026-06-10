# syntax=docker/dockerfile:1
# Production image for Coolify (Next.js 16 + Prisma 7 + Better Auth, pnpm).

# ----------------------------- base ------------------------------------
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1
# openssl/ca-certificates are needed by the Prisma engine used for migrations.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
# pnpm is provided via corepack and pinned by package.json's "packageManager".
RUN corepack enable
WORKDIR /app

# ----------------------------- build -----------------------------------
FROM base AS build
# Install dependencies first so this layer is cached unless the manifests change.
# pnpm-workspace.yaml carries the build-script approvals AND the kysely override
# (Better Auth's adapter breaks on kysely 0.29.x), so it must be present.
# prisma/ is required by the `postinstall` (`prisma generate`).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# App source, then build.
COPY . .
# `next build` evaluates src/lib/env.ts, which requires these to be set. They are
# build-time placeholders only — the real values are injected by Coolify at
# runtime. (DATABASE_URL is not connected to during the build.)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    BETTER_AUTH_SECRET="docker-build-placeholder-secret-change-me" \
    BETTER_AUTH_URL="http://localhost:5088"
RUN pnpm exec prisma generate && pnpm build

# ----------------------------- runner ----------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=5088
# Copy the fully built app (incl. node_modules with the Prisma CLI used for
# migrations, the generated client, and the pg adapter). Owned by the non-root
# `node` user that ships with the base image.
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 5088
# Apply pending migrations (idempotent), then start the server on :5088.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]
