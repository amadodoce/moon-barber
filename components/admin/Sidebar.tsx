"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scissors,
  Users,
  Clock,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { BrandMark } from "@/components/brand";
import { useAdminSidebar } from "./AdminSidebarContext";

const navGroups = [
  {
    label: "نمای کلی",
    items: [{ href: "/admin", label: "داشبورد", icon: LayoutDashboard }],
  },
  {
    label: "پیکربندی",
    items: [
      { href: "/admin/services", label: "سرویس‌ها", icon: Scissors },
      { href: "/admin/barbers", label: "آرایشگرها", icon: Users },
      { href: "/admin/schedule", label: "ساعات کاری", icon: Clock },
    ],
  },
  {
    label: "عملیات",
    items: [
      { href: "/admin/appointments", label: "نوبت‌ها", icon: Calendar },
      { href: "/admin/payments", label: "پرداخت‌ها", icon: CreditCard },
    ],
  },
  {
    label: "محتوا",
    items: [{ href: "/admin/content", label: "صفحه اصلی", icon: FileText }],
  },
];

function isNavActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(href);
}

export function Sidebar({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const { expanded, toggleExpanded, setMobileOpen } = useAdminSidebar();
  const isExpanded = mobile || expanded;

  const closeMobile = () => {
    if (mobile) setMobileOpen(false);
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden bg-[var(--color-paper-2)]"
      style={{
        borderLeft: mobile ? undefined : "1px solid var(--color-rule)",
      }}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center gap-[var(--space-2xs)] border-b border-[var(--color-rule)] px-3">
        <div
          className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          {isExpanded ? (
            <BrandMark size="sm" asLink={false} />
          ) : (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
              aria-hidden="true"
            >
              <Scissors className="h-4 w-4" />
            </span>
          )}
          {isExpanded ? (
            <span className="truncate text-xs text-[var(--color-ink-muted)]">
              پنل مدیریت
            </span>
          ) : null}
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-rule)] text-[var(--color-ink-2)] transition-colors hover:bg-[var(--color-paper-3)]"
            aria-label="بستن منو"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleExpanded}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink-2)] transition-all hover:scale-105 active:scale-95"
            aria-label={expanded ? "جمع کردن منو" : "باز کردن منو"}
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-[var(--space-sm)]" aria-label="منوی مدیریت">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-[var(--space-xs)]">
            {isExpanded ? (
              <p className="mb-1 px-3 text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      title={!isExpanded ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className="flex items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium transition-colors duration-150"
                      style={{
                        color: active
                          ? "var(--color-accent)"
                          : "var(--color-ink-2)",
                        backgroundColor: active
                          ? "var(--color-accent-soft)"
                          : undefined,
                        justifyContent: isExpanded ? "flex-start" : "center",
                      }}
                    >
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span
                        className="whitespace-nowrap overflow-hidden"
                        style={{
                          opacity: isExpanded ? 1 : 0,
                          width: isExpanded ? "auto" : 0,
                          transition: "opacity 150ms ease, width 200ms ease",
                        }}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-[var(--color-rule)] p-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={!isExpanded ? "خروج" : undefined}
          className="flex w-full items-center gap-3 rounded-[var(--radius-input)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink-2)] transition-colors hover:bg-[var(--status-failed-bg)] hover:text-[var(--status-failed-fg)]"
          style={{
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span
            className="whitespace-nowrap overflow-hidden"
            style={{
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? "auto" : 0,
              transition: "opacity 150ms ease, width 200ms ease",
            }}
          >
            خروج
          </span>
        </button>
      </div>
    </div>
  );
}
