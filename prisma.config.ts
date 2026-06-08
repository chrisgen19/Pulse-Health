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
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
