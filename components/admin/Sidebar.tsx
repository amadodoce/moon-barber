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

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white dark:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-700">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-zinc-100 dark:border-zinc-700 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
          <Scissors className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">پنل مدیریت</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-zinc-100 dark:border-zinc-700 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          خروج
        </button>
      </div>
    </div>
  );
}
