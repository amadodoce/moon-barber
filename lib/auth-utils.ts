import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/app/generated/prisma/enums";

export interface AuthResult {
  userId: string;
  role: UserRole;
  name: string | null;
  phone: string;
}

/**
 * Get the current authenticated user session.
 * Throws if not authenticated.
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("AUTH_REQUIRED");
  }
  const user = session.user as { id: string; phone: string; role: UserRole; name: string | null };
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}

/**
 * Get the current authenticated user session.
 * Returns null if not authenticated.
 */
export async function getAuth(): Promise<AuthResult | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const user = session.user as { id: string; phone: string; role: UserRole; name: string | null };
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}

/**
 * Require ADMIN role. Throws if not admin.
 * Used in server actions — throws for error handling.
 */
export async function requireAdmin(): Promise<AuthResult> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Require ADMIN or BARBER role.
 * Used in server actions — throws for error handling.
 */
export async function requireAdminOrBarber(): Promise<AuthResult> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "BARBER") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

/**
 * Require ADMIN role for page-level protection.
 * Redirects to /login if not authenticated, / if not admin.
 */
export async function requireAdminPage(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const user = session.user as { id: string; phone: string; role: UserRole; name: string | null };
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    phone: user.phone,
  };
}

/** Standard action response type */
export type ActionResponse<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/** Safe error handler for server actions */
export function handleActionError(error: unknown): ActionResponse<never> {
  if (error instanceof Error) {
    switch (error.message) {
      case "AUTH_REQUIRED":
        return { success: false, error: "لطفاً ابتدا وارد شوید" };
      case "FORBIDDEN":
        return {
          success: false,
          error: "شما دسترسی به این عملیات را ندارید",
        };
      default:
        return { success: false, error: error.message };
    }
  }
  return { success: false, error: "خطای داخلی سرور" };
}
