"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/app/generated/prisma/enums";

interface UseCurrentUserReturn {
  user: {
    id: string;
    name: string;
    phone: string;
    role: UserRole;
    avatar: string | null;
  } | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isBarber: boolean;
  isCustomer: boolean;
  isLoading: boolean;
}

export function useCurrentUser(): UseCurrentUserReturn {
  const { data: session, status } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        phone: session.user.phone,
        role: session.user.role,
        avatar: session.user.avatar,
      }
    : null;

  return {
    user,
    isAuthenticated: status === "authenticated",
    isAdmin: user?.role === "ADMIN",
    isBarber: user?.role === "BARBER",
    isCustomer: user?.role === "CUSTOMER",
    isLoading: status === "loading",
  };
}
