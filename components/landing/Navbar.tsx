"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useCurrentUser();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2A] bg-[#0A0A0A]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A853]">
            <Scissors className="h-4 w-4 text-[#0A0A0A]" />
          </div>
          <span className="text-lg font-bold text-white">آرایشگاه</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className={`text-sm transition-colors ${
              pathname === "/"
                ? "text-[#D4A853]"
                : "text-[#9A9A9A] hover:text-white"
            }`}
          >
            صفحه اصلی
          </Link>
          {isAuthenticated && (user?.role === "ADMIN" || user?.role === "BARBER") && (
            <Link
              href="/admin"
              className={`text-sm transition-colors ${
                pathname.startsWith("/admin")
                  ? "text-[#D4A853]"
                  : "text-[#9A9A9A] hover:text-white"
              }`}
            >
              پنل مدیریت
            </Link>
          )}
          {isAuthenticated && user?.role === "CUSTOMER" && (
            <Link
              href="/dashboard"
              className={`text-sm transition-colors ${
                pathname === "/dashboard"
                  ? "text-[#D4A853]"
                  : "text-[#9A9A9A] hover:text-white"
              }`}
            >
              نوبت‌های من
            </Link>
          )}
          <Link
            href="/book"
            className="rounded-lg bg-[#D4A853] px-4 py-2 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#C49A48]"
          >
            رزرو نوبت
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1 text-sm text-[#9A9A9A] transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-[#9A9A9A] transition-colors hover:text-white"
            >
              ورود
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 text-[#9A9A9A] hover:text-white md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-[#2A2A2A] bg-[#0A0A0A] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-[#9A9A9A] hover:text-white"
            >
              صفحه اصلی
            </Link>
            {isAuthenticated && (user?.role === "ADMIN" || user?.role === "BARBER") && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#9A9A9A] hover:text-white"
              >
                پنل مدیریت
              </Link>
            )}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#9A9A9A] hover:text-white"
              >
                نوبت‌های من
              </Link>
            )}
            <Link
              href="/book"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-[#D4A853] px-4 py-2 text-center text-sm font-semibold text-[#0A0A0A]"
            >
              رزرو نوبت
            </Link>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center justify-center gap-1 text-sm text-[#9A9A9A] hover:text-white"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-[#9A9A9A] hover:text-white"
              >
                ورود
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
