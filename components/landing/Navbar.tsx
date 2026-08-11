"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const sectionLinks = [
  { href: "#services", label: "خدمات" },
  { href: "#how-it-works", label: "نحوه رزرو" },
  { href: "#team", label: "تیم" },
  { href: "#contact", label: "تماس" },
] as const;

function navLinkClass(active: boolean) {
  return `inline-flex min-h-11 items-center px-[var(--space-xs)] text-[var(--text-sm)] transition-colors duration-[var(--dur-short)] ${
    active
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
  }`;
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useCurrentUser();
  const pathname = usePathname();
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement>(null);

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    firstMenuLinkRef.current?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const roleLinks = (
    <>
      {isAuthenticated && user?.role === "ADMIN" && (
        <Link
          href="/admin"
          className={navLinkClass(pathname.startsWith("/admin"))}
        >
          پنل مدیریت
        </Link>
      )}
      {isAuthenticated && user?.role === "BARBER" && (
        <Link
          href="/barber"
          className={navLinkClass(pathname.startsWith("/barber"))}
        >
          پنل آرایشگر
        </Link>
      )}
      {isAuthenticated && user?.role === "CUSTOMER" && (
        <Link
          href="/customer"
          className={navLinkClass(pathname === "/customer")}
        >
          نوبت‌های من
        </Link>
      )}
    </>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-rule)] bg-[var(--color-paper)]/95 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-[var(--space-sm)] px-[var(--space-md)] py-[var(--space-2xs)]">
        <BrandMark size="md" />

        <nav
          className="hidden items-center gap-[var(--space-3xs)] md:flex"
          aria-label="ناوبری اصلی"
        >
          {sectionLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(false)}>
              {link.label}
            </Link>
          ))}
          {roleLinks}
        </nav>

        <div className="flex items-center gap-[var(--space-2xs)]">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden min-h-11 items-center gap-[var(--space-3xs)] px-[var(--space-xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] transition-colors duration-[var(--dur-short)] hover:text-[var(--color-ink)] md:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              خروج
            </button>
          ) : (
            <Link
              href="/login"
              className={`${navLinkClass(false)} hidden md:inline-flex`}
            >
              ورود
            </Link>
          )}
          <Button
            variant="brand"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/book" />}
          >
            رزرو نوبت
          </Button>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--color-ink-muted)] transition-colors duration-[var(--dur-short)] hover:text-[var(--color-ink)] md:hidden touch-manipulation"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "بستن منو" : "باز کردن منو"}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id={menuId}
          className="border-t border-[var(--color-rule)] bg-[var(--color-paper)] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="منوی موبایل"
        >
          <nav
            className="mx-auto flex max-w-6xl flex-col px-[var(--space-md)] py-[var(--space-sm)]"
            aria-label="ناوبری موبایل"
          >
            {sectionLinks.map((link, index) => (
              <Link
                key={link.href}
                ref={index === 0 ? firstMenuLinkRef : undefined}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center border-b border-[var(--color-rule)]/60 px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] transition-colors duration-[var(--dur-short)] last:border-b-0 hover:text-[var(--color-ink)]"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center border-b border-[var(--color-rule)]/60 px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                پنل مدیریت
              </Link>
            )}
            {isAuthenticated && user?.role === "BARBER" && (
              <Link
                href="/barber"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center border-b border-[var(--color-rule)]/60 px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                پنل آرایشگر
              </Link>
            )}
            {isAuthenticated && user?.role === "CUSTOMER" && (
              <Link
                href="/customer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex min-h-11 items-center border-b border-[var(--color-rule)]/60 px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                نوبت‌های من
              </Link>
            )}
            <div className="mt-[var(--space-sm)] flex flex-col gap-[var(--space-2xs)]">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="inline-flex min-h-11 items-center gap-[var(--space-2xs)] px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  خروج
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center px-[var(--space-2xs)] text-[var(--text-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  ورود
                </Link>
              )}
              <Button
                variant="brand"
                className="w-full"
                render={<Link href="/book" onClick={() => setMenuOpen(false)} />}
              >
                رزرو نوبت
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
