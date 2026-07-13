import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { UserRole } from "@/app/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string;
      role: UserRole;
      avatar: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    phone: string;
    role: UserRole;
    avatar: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    phone: string;
    role: UserRole;
    avatar: string | null;
  }
}
