"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors, Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useCurrentUser();
  const pathname = usePathname();
  const menuId = useId();

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between rounded-full border border-[#2a2520] bg-[#0c0b09]/90 px-5 py-2.5 backdrop-blur-md">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A853]">
              <Scissors className="h-4 w-4 text-[#0c0b09]" />
            </div>
            <span className="text-base font-bold text-[#f5f0e8]">آرایشگاه</span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                pathname === "/"
                  ? "bg-[#D4A853]/10 text-[#D4A853]"
                  : "text-[#8a8578] hover:text-[#f5f0e8]"
              }`}
            >
              صفحه اصلی
            </Link>
            {isAuthenticated &&
              (user?.role === "ADMIN" || user?.role === "BARBER") && (
                <Link
                  href="/admin"
                  className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                    pathname.startsWith("/admin")
                      ? "bg-[#D4A853]/10 text-[#D4A853]"
                      : "text-[#8a8578] hover:text-[#f5f0e8]"
                  }`}
                >
                  پنل مدیریت
                </Link>
              )}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                href="/dashboard"
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                  pathname === "/dashboard"
                    ? "bg-[#D4A853]/10 text-[#D4A853]"
                    : "text-[#8a8578] hover:text-[#f5f0e8]"
                }`}
              >
                نوبت‌های من
              </Link>
            )}
          </nav>

          {/* Right side — CTA + auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[#8a8578] transition-colors duration-150 hover:text-[#f5f0e8] md:flex"
              >
                <LogOut className="h-3.5 w-3.5" />
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-sm text-[#8a8578] transition-colors duration-150 hover:text-[#f5f0e8] md:inline"
              >
                ورود
              </Link>
            )}
            <Link
              href="/book"
              className="rounded-full bg-[#D4A853] px-4 py-2 text-sm font-semibold text-[#0c0b09] transition-colors duration-150 hover:bg-[#C49A48]"
            >
              رزرو نوبت
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 text-[#8a8578] hover:text-[#f5f0e8] md:hidden touch-manipulation active:opacity-70"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id={menuId}
          className="mx-6 mb-4 rounded-2xl border border-[#2a2520] bg-[#0c0b09]/95 p-4 backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm text-[#8a8578] hover:bg-[#D4A853]/10 hover:text-[#f5f0e8]"
            >
              صفحه اصلی
            </Link>
            {isAuthenticated &&
              (user?.role === "ADMIN" || user?.role === "BARBER") && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-[#8a8578] hover:bg-[#D4A853]/10 hover:text-[#f5f0e8]"
                >
                  پنل مدیریت
                </Link>
              )}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[#8a8578] hover:bg-[#D4A853]/10 hover:text-[#f5f0e8]"
              >
                نوبت‌های من
              </Link>
            )}
            <div className="my-1 h-px bg-[#2a2520]" />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-[#8a8578] hover:bg-[#D4A853]/10 hover:text-[#f5f0e8]"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[#8a8578] hover:bg-[#D4A853]/10 hover:text-[#f5f0e8]"
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
