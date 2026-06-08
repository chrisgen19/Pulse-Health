import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load the same env file Next.js uses for local secrets. dotenv does NOT
// override vars already present in process.env, so platform-provided
// DATABASE_URL (e.g. Vercel) still wins in deployed environments.
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Do NOT throw when DATABASE_URL is missing here. This config is loaded for
  // every Prisma command, including `prisma generate` (run via postinstall),
  // which needs no database connection — requiring the URL would break
  // `pnpm install` on a fresh checkout/CI before .env.local exists. The
  // datasource is "required for migration/introspection commands" only, and
  // Prisma enforces that itself. The app's runtime guard lives in
  // src/lib/prisma.ts, where a missing URL is a real error.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
