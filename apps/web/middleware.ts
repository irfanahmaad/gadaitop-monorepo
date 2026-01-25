import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import type { NextRequest } from "next/server"

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"]

// API routes that should be excluded from middleware
const excludedApiRoutes = ["/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes (except our protected ones)
  if (pathname.startsWith("/api")) {
    // Allow NextAuth routes
    if (excludedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }
    // Other API routes go through proxy
    return NextResponse.next()
  }

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isLoginPage = pathname === "/login"
  const hasSessionExpiredError = token?.error === "RefreshAccessTokenError"
  const hasSessionExpiredParam =
    request.nextUrl.searchParams.get("error") === "SessionExpired"

  // Check if token has expired - handle this FIRST before other checks
  if (hasSessionExpiredError) {
    // If already on login page with SessionExpired, allow it to proceed
    // This prevents redirect loops
    if (isLoginPage) {
      return NextResponse.next()
    }

    // Clear the session cookies and redirect to login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("error", "SessionExpired")
    // Only set callbackUrl if it's not already the login page or other auth routes to avoid loops
    // Also ensure callbackUrl is not /login to prevent redirect loops after successful login
    if (pathname !== "/login" && !isAuthRoute && pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", pathname)
    }

    const response = NextResponse.redirect(loginUrl)

    // Clear NextAuth session cookies (both HTTP and HTTPS variants)
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    // Also clear any other potential NextAuth cookie names
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("__Secure-next-auth.csrf-token")

    return response
  }

  // If already on login page with SessionExpired param, allow it (handles edge cases)
  if (isLoginPage && hasSessionExpiredParam) {
    return NextResponse.next()
  }

  // Determine if user is authenticated (token exists AND no error)
  const isAuthenticated = !!token && !token.error

  // If user is authenticated and tries to access auth routes, redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user is not authenticated and tries to access protected routes
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
