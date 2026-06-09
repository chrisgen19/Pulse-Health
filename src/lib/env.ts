import { z } from "zod";

/**
 * Validated environment variables. Import from here instead of reading
 * `process.env` directly in feature code, so a missing/invalid value fails
 * fast with a clear message at startup.
 */
// The placeholder shipped in .env.example — must never be used as a real secret.
const PLACEHOLDER_SECRET = "replace-with-a-32-byte-random-secret";

const schema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters")
    .refine(
      (v) => v !== PLACEHOLDER_SECRET,
      "BETTER_AUTH_SECRET must be changed from the .env.example placeholder",
    ),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  // Optional comma-separated list of additional allowed origins (e.g. preview
  // deployment URLs, an apex/www variant, or 127.0.0.1 in dev).
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    ),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
