import type { UserRole } from "@/app/generated/prisma/enums";

/** Validate an internal callback path to prevent open redirects. */
export function getSafeCallbackUrl(
  callbackUrl: string,
  role: UserRole
): string {
  const isSafeInternalPath =
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//") &&
    !callbackUrl.includes("://");

  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "BARBER") {
    return "/barber";
  }

  if (role === "CUSTOMER") {
    if (isSafeInternalPath && callbackUrl !== "/") {
      return callbackUrl;
    }
    return "/customer";
  }

  return isSafeInternalPath ? callbackUrl : "/";
}
