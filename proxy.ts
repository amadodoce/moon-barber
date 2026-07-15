import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/book", "/dashboard/payment/result"];
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

  // Check authentication
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin-only routes
  if (isAdminRoute(pathname) && session.user.role !== "ADMIN" && session.user.role !== "BARBER") {
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
