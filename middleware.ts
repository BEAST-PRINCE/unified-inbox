// middleware.ts (or proxy.ts)

import { type NextRequest, NextResponse } from "next/server";

const apiAuthPrefix = "/api/auth";
const apiWebhookPrefix = "/api/webhooks/twilio";
const publicRoutes = ["/", "/login", "/register"];
const protectedRoutes = ["/inbox", "/dashboard", "/settings", "/contacts"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes to pass through without auth check
  if (pathname.startsWith(apiAuthPrefix) || pathname.startsWith(apiWebhookPrefix)) {
    return NextResponse.next();
  }

  // Check for session cookie directly (not using getCookieCache)
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie?.value;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // If has session and trying to access public routes (like /login), redirect to inbox
  if (hasSession && isPublicRoute) {
    return NextResponse.redirect(new URL("/inbox", request.url));
  }

  // If no session and trying to access protected routes, redirect to login
  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
