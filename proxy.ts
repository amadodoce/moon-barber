import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/book",
  "/customer/payment/result",
  "/book/payment-gateway",
  "/api/payment/callback",
];
const authApiRoutes = ["/api/auth"];

function isPublicRoute(pathname: string): boolean {
  if (publicRoutes.includes(pathname)) return true;
  if (publicRoutes.some((route) => pathname.startsWith(route + "/"))) return true;
  if (authApiRoutes.some((route) => pathname.startsWith(route))) return true;
  return false;
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;
  if (isAdminRoute(pathname) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.png$|.*\\.svg$|.*\\.woff2$|.*\\.woff$|.*\\.ttf$).*)",
  ],
};
