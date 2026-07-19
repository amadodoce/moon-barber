import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/book", "/dashboard/payment/result", "/book/payment-gateway"];
const authApiRoutes = ["/api/auth"];

function isPublicRoute(pathname: string): boolean {
  // Exact matches for public pages
  if (publicRoutes.includes(pathname)) return true;
  // Prefix matches for nested public routes
  if (publicRoutes.some((route) => pathname.startsWith(route + "/"))) return true;
  // Auth API routes (login, register, callback, etc.)
  if (authApiRoutes.some((route) => pathname.startsWith(route))) return true;
  return false;
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin-only routes
  const role = token.role as string | undefined;
  if (isAdminRoute(pathname) && role !== "ADMIN" && role !== "BARBER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
