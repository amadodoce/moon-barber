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
        <div className="flex items-center justify-between rounded-full border border-[var(--surface-border)] bg-[var(--surface-base)]/90 px-5 py-2.5 backdrop-blur-md">
          {/* Logo — left */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--booking-gold)]">
              <Scissors className="h-4 w-4 text-[var(--surface-base)]" />
            </div>
            <span className="text-base font-bold text-[var(--text-primary)]">
              آرایشگاه
            </span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                pathname === "/"
                  ? "bg-[var(--booking-gold)]/10 text-[var(--booking-gold)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                      ? "bg-[var(--booking-gold)]/10 text-[var(--booking-gold)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                    ? "bg-[var(--booking-gold)]/10 text-[var(--booking-gold)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] md:flex"
              >
                <LogOut className="h-3.5 w-3.5" />
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden rounded-full px-3.5 py-1.5 text-sm text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)] md:inline"
              >
                ورود
              </Link>
            )}
            <Link
              href="/book"
              className="rounded-full bg-[var(--booking-gold)] px-4 py-2 text-sm font-semibold text-[var(--surface-base)] transition-colors duration-150 hover:bg-[var(--booking-gold-hover)]"
            >
              رزرو نوبت
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              onPointerDown={() => setMenuOpen((prev) => !prev)} // ← اضافه کنید
              onTouchStart={(e) => {
                e.preventDefault(); // اختیاری
                setMenuOpen((prev) => !prev);
              }}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden touch-manipulation active:opacity-70"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id={menuId}
          className="mx-6 mb-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-base)]/95 p-4 backdrop-blur-md md:hidden"
        >
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--booking-gold)]/10 hover:text-[var(--text-primary)]"
            >
              صفحه اصلی
            </Link>
            {isAuthenticated &&
              (user?.role === "ADMIN" || user?.role === "BARBER") && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--booking-gold)]/10 hover:text-[var(--text-primary)]"
                >
                  پنل مدیریت
                </Link>
              )}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--booking-gold)]/10 hover:text-[var(--text-primary)]"
              >
                نوبت‌های من
              </Link>
            )}
            <div className="my-1 h-px bg-[var(--surface-border)]" />
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--booking-gold)]/10 hover:text-[var(--text-primary)]"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--booking-gold)]/10 hover:text-[var(--text-primary)]"
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
