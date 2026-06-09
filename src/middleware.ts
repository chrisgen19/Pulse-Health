import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_ROUTES = ["/login", "/register"];

/**
 * Optimistic auth gating (Edge-safe, no DB call): redirect users with no
 * session cookie away from protected routes to /login.
 *
 * We deliberately do NOT redirect cookie-bearing users away from /login or
 * /register here. The cookie is unverified, so a stale/revoked cookie would
 * ping-pong with the server-validated redirect in src/app/page.tsx and lock the
 * user out. The "already signed in -> go to the app" redirect is instead done
 * with a real session check in src/app/(auth)/layout.tsx.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
