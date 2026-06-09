import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Exposes all Better Auth endpoints (sign-up, sign-in, sign-out, session, ...)
// under /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
