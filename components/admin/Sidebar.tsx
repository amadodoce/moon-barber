"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/services", label: "سرویس‌ها", icon: Scissors },
  { href: "/admin/barbers", label: "آرایشگرها", icon: Users },
  { href: "/admin/schedule", label: "ساعات کاری", icon: Clock },
  { href: "/admin/appointments", label: "نوبت‌ها", icon: Calendar },
  { href: "/admin/payments", label: "پرداخت‌ها", icon: CreditCard },
  { href: "/admin/content", label: "محتوای صفحه", icon: FileText },
];

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function Sidebar({ onClose, mobile }: { onClose?: () => void; mobile?: boolean }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (mobile) return;
    const saved = localStorage.getItem("admin-sidebar-expanded");
    if (saved !== null) setExpanded(saved === "true");
  }, [mobile]);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem("admin-sidebar-expanded", String(next));
  };

  const isExpanded = mobile || expanded;
  const width = isExpanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{
        width: mobile ? undefined : width,
        minWidth: mobile ? undefined : width,
        backgroundColor: "var(--surface-overlay)",
        borderLeft: mobile ? undefined : "1px solid var(--surface-border)",
        transition: mobile ? undefined : "width 200ms ease, min-width 200ms ease",
      }}
    >
      {/* Logo + toggle */}
      <div
        className="flex h-16 shrink-0 items-center gap-2 border-b px-3"
        style={{ borderColor: "var(--surface-border)" }}
      >
        {/* Logo — always visible, centered when collapsed */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: "var(--booking-gold)",
            marginLeft: isExpanded ? 0 : "auto",
            marginRight: isExpanded ? 0 : "auto",
          }}
        >
          <Scissors className="h-4 w-4" style={{ color: "var(--surface-base)" }} />
        </div>

        {/* Title — fades out when collapsed */}
        <span
          className="text-lg font-bold whitespace-nowrap overflow-hidden"
          style={{
            color: "var(--text-primary)",
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? "auto" : 0,
            transition: "opacity 150ms ease, width 200ms ease",
          }}
        >
          پنل مدیریت
        </span>

        {/* Toggle button — right side when expanded, hidden when collapsed */}
        {!mobile && (
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              borderColor: "var(--surface-border)",
              backgroundColor: "var(--surface-base)",
              color: "var(--text-secondary)",
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? 32 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
              transition: "opacity 150ms ease, width 200ms ease",
            }}
            aria-label={expanded ? "جمع کردن منو" : "باز کردن منو"}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button — visible only when collapsed */}
      {!mobile && !isExpanded && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 hover:scale-105 active:scale-95"
            style={{
              borderColor: "var(--surface-border)",
              backgroundColor: "var(--surface-base)",
              color: "var(--text-secondary)",
            }}
            aria-label="باز کردن منو"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={!isExpanded ? item.label : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
              style={{
                color: isActive ? "var(--booking-gold)" : "var(--text-secondary)",
                backgroundColor: isActive ? "color-mix(in srgb, var(--booking-gold) 10%, transparent)" : undefined,
                justifyContent: isExpanded ? "flex-start" : "center",
                transition: "background-color 150ms ease, color 150ms ease, justify-content 150ms ease",
              }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {/* Label — fades out when collapsed */}
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
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="shrink-0 border-t p-2"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={!isExpanded ? "خروج" : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-red-500/10 hover:text-red-500"
          style={{
            color: "var(--text-secondary)",
            justifyContent: isExpanded ? "flex-start" : "center",
          }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {/* Label — fades out when collapsed */}
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

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
