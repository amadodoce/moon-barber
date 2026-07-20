import { prisma } from "@/lib/prisma";
import {
  Calendar,
  CreditCard,
  Scissors,
  Clock,
} from "lucide-react";
import { formatFaDate } from "@/lib/dates";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todayAppointments,
    pendingAppointments,
    totalRevenue,
    activeServices,
    recentAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: {
        date: { gte: today, lt: tomorrow },
        deletedAt: null,
      },
    }),
    prisma.appointment.count({
      where: { status: "PENDING", deletedAt: null },
    }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.service.count({
      where: { isActive: true, deletedAt: null },
    }),
    prisma.appointment.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true, phone: true } },
        barber: {
          include: { user: { select: { name: true } } },
        },
        appointmentServices: {
          include: { service: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    todayAppointments,
    pendingAppointments,
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    activeServices,
    recentAppointments,
  };
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "در انتظار", bg: "color-mix(in srgb, #eab308 12%, transparent)", text: "#eab308" },
  CONFIRMED: { label: "تایید شده", bg: "color-mix(in srgb, #3b82f6 12%, transparent)", text: "#3b82f6" },
  COMPLETED: { label: "انجام شده", bg: "color-mix(in srgb, #22c55e 12%, transparent)", text: "#22c55e" },
  CANCELLED: { label: "لغو شده", bg: "color-mix(in srgb, #ef4444 12%, transparent)", text: "#ef4444" },
  NO_SHOW: { label: "عدم حضور", bg: "color-mix(in srgb, #71717a 12%, transparent)", text: "#71717a" },
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>داشبورد</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="نوبت‌های امروز"
          value={stats.todayAppointments}
          accentColor="#3b82f6"
        />
        <StatCard
          icon={Clock}
          label="در انتظار تایید"
          value={stats.pendingAppointments}
          accentColor="#eab308"
        />
        <StatCard
          icon={CreditCard}
          label="درآمد کل"
          value={`${stats.totalRevenue.toLocaleString("fa-IR")} تومان`}
          accentColor="#22c55e"
        />
        <StatCard
          icon={Scissors}
          label="سرویس‌های فعال"
          value={stats.activeServices}
          accentColor="#a855f7"
        />
      </div>

      {/* Recent appointments */}
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: "var(--surface-overlay)", borderColor: "var(--surface-border)" }}
      >
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          آخرین نوبت‌ها
        </h2>
        <div className="space-y-3">
          {stats.recentAppointments.map((appt) => {
            const status = statusConfig[appt.status] ?? {
              label: appt.status,
              bg: "color-mix(in srgb, #71717a 12%, transparent)",
              text: "#71717a",
            };
            return (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-xl border p-4"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                    style={{ backgroundColor: "var(--surface-border)", color: "var(--text-secondary)" }}
                  >
                    {appt.user.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {appt.user.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {appt.barber.user.name} • {formatFaDate(appt.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    {appt.startTime}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
          {stats.recentAppointments.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              هنوز نوبتی ثبت نشده است
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--surface-overlay)", borderColor: "var(--surface-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
        >
          <Icon className="h-6 w-6" style={{ color: accentColor }} />
        </div>
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</p>
          <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
        </div>
      </div>
    </div>
  );
}
