import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_ROUTES = ["/login", "/register"];

/**
 * Optimistic auth gating. Reads only the session cookie (no DB call), so it is
 * Edge-safe and fast:
 *   - unauthenticated users hitting the app are sent to /login
 *   - authenticated users hitting /login or /register are sent to the app
 *
 * The cookie is not cryptographically verified here — that happens in the route
 * handlers/server code. This is just a redirect optimization.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!sessionCookie && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register"],
};
