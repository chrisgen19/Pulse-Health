import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/**
 * Better Auth server instance. Email/password auth backed by the existing
 * Prisma (Postgres) client. The route handler in
 * src/app/api/auth/[...all]/route.ts exposes this over HTTP.
 */
export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  // baseURL is trusted by default; add any extra origins (previews, apex/www,
  // 127.0.0.1) so cross-origin sign-in requests aren't rejected.
  trustedOrigins: [env.BETTER_AUTH_URL, ...env.TRUSTED_ORIGINS],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  // nextCookies must be the last plugin so it can set cookies on the response.
  plugins: [nextCookies()],
});
