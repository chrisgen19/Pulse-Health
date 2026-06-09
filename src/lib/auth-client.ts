import { createAuthClient } from "better-auth/react";

/**
 * Better Auth browser client. Talks to the route handler on the same origin
 * (`/api/auth`), so no baseURL is needed. Use the exported helpers in Client
 * Components.
 */
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
