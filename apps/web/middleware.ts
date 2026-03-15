import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

import type { NextRequest } from "next/server"

// Staff routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]

// Customer portal routes
const customerLoginPath = "/portal-customer/login"
const customerPortalPrefix = "/portal-customer"

// Routes that should redirect to dashboard if already authenticated (staff)
const authRoutes = ["/login", "/register"]

// API routes that should be excluded from middleware
const excludedApiRoutes = ["/api/auth"]

function isCustomerPortalRoute(pathname: string): boolean {
  return pathname.startsWith(customerPortalPrefix)
}

function isCustomerLoginRoute(pathname: string): boolean {
  return pathname === customerLoginPath
}

function isCustomerProtectedRoute(pathname: string): boolean {
  return isCustomerPortalRoute(pathname) && !isCustomerLoginRoute(pathname)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes (except our protected ones)
  if (pathname.startsWith("/api")) {
    if (excludedApiRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }
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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const accountType = (token as { accountType?: "staff" | "customer" })
    ?.accountType as "staff" | "customer" | undefined
  const isCustomerSession = accountType === "customer"

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))
  const isLoginPage = pathname === "/login"
  const hasSessionExpiredError = token?.error === "RefreshAccessTokenError"
  const hasSessionExpiredParam =
    request.nextUrl.searchParams.get("error") === "SessionExpired"

  // Handle session expired - redirect to appropriate login
  if (hasSessionExpiredError) {
    if (isCustomerLoginRoute(pathname) || isLoginPage) {
      return NextResponse.next()
    }

    const isCustomerRealm = isCustomerPortalRoute(pathname)
    const loginUrl = new URL(
      isCustomerRealm ? customerLoginPath : "/login",
      request.url
    )
    loginUrl.searchParams.set("error", "SessionExpired")
    if (
      (isCustomerRealm && !isCustomerLoginRoute(pathname)) ||
      (!isCustomerRealm && pathname !== "/login" && !isAuthRoute && pathname !== "/")
    ) {
      loginUrl.searchParams.set("callbackUrl", pathname)
    }

    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("next-auth.session-token")
    response.cookies.delete("__Secure-next-auth.session-token")
    response.cookies.delete("next-auth.csrf-token")
    response.cookies.delete("__Secure-next-auth.csrf-token")

    return response
  }

  if ((isLoginPage || isCustomerLoginRoute(pathname)) && hasSessionExpiredParam) {
    return NextResponse.next()
  }

  const isAuthenticated = !!token && !token.error

  // Authenticated customer: redirect away from customer login, block staff routes
  if (isAuthenticated && isCustomerSession) {
    if (isCustomerLoginRoute(pathname)) {
      return NextResponse.redirect(new URL(customerPortalPrefix, request.url))
    }
    if (!isCustomerPortalRoute(pathname)) {
      return NextResponse.redirect(new URL(customerPortalPrefix, request.url))
    }
    return NextResponse.next()
  }

  // Authenticated staff: redirect away from staff auth routes, block customer portal
  if (isAuthenticated && !isCustomerSession) {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (isCustomerPortalRoute(pathname)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Unauthenticated: protect customer portal and staff routes
  if (!isAuthenticated) {
    if (isCustomerProtectedRoute(pathname)) {
      const loginUrl = new URL(customerLoginPath, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (!isPublicRoute && !isCustomerLoginRoute(pathname)) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Staff role-based redirects for "/"
  const roles = (token as { roles?: Array<{ code?: string }> })?.roles ?? []
  const isBranchStaff = roles.some((r) => r.code === "branch_staff")
  const isStockAuditor = roles.some((r) => r.code === "stock_auditor")
  const isAuctionStaff = roles.some((r) => r.code === "auction_staff")
  const isMarketingStaff = roles.some((r) => r.code === "marketing_staff")

  if (isAuthenticated && pathname === "/" && !isCustomerSession) {
    if (isBranchStaff) return NextResponse.redirect(new URL("/scan-ktp", request.url))
    if (isStockAuditor)
      return NextResponse.redirect(new URL("/stock-opname/auditor", request.url))
    if (isAuctionStaff)
      return NextResponse.redirect(new URL("/validasi-lelangan", request.url))
    if (isMarketingStaff)
      return NextResponse.redirect(new URL("/lelangan", request.url))
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
