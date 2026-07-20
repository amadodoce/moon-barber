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

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-expanded");
    if (saved !== null) setExpanded(saved === "true");
  }, []);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    localStorage.setItem("admin-sidebar-expanded", String(next));
  };

  const width = expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <div
      className="flex h-full flex-col transition-[width] duration-200"
      style={{
        width,
        minWidth: width,
        backgroundColor: "var(--surface-overlay)",
        borderLeft: "1px solid var(--surface-border)",
      }}
    >
      {/* Logo + toggle */}
      <div
        className="flex h-16 items-center gap-2 border-b px-4"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--booking-gold)" }}
        >
          <Scissors className="h-4 w-4" style={{ color: "var(--surface-base)" }} />
        </div>
        {expanded && (
          <span
            className="text-lg font-bold whitespace-nowrap"
            style={{ color: "var(--text-primary)" }}
          >
            پنل مدیریت
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          className="mr-auto rounded-lg p-1.5 transition-colors hover:bg-[var(--surface-border)]"
          aria-label={expanded ? "جمع کردن منو" : "باز کردن منو"}
        >
          {expanded ? (
            <ChevronsRight className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          ) : (
            <ChevronsLeft className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          )}
        </button>
      </div>

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
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive ? "" : ""
              }`}
              style={{
                color: isActive ? "var(--booking-gold)" : "var(--text-secondary)",
                backgroundColor: isActive ? "color-mix(in srgb, var(--booking-gold) 10%, transparent)" : undefined,
                justifyContent: expanded ? "flex-start" : "center",
              }}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        className="border-t p-2"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={!expanded ? "خروج" : undefined}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-red-500/10 hover:text-red-500"
          style={{
            color: "var(--text-secondary)",
            justifyContent: expanded ? "flex-start" : "center",
          }}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {expanded && <span className="whitespace-nowrap">خروج</span>}
        </button>
      </div>
    </div>
  );
}

export { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH };
