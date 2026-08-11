import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatFaDate } from "@/lib/dates";
import {
  PageHeader,
  StatCard,
  StatusBadge,
  SurfaceCard,
  EmptyState,
} from "@/components/brand";
import { getAppointmentStatus } from "@/lib/status-config";

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

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="داشبورد"
        description="نمای کلی عملیات و نوبت‌های اخیر"
        eyebrow="مدیریت"
      />

      <div className="grid grid-cols-1 gap-[var(--space-sm)] sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="نوبت‌های امروز" value={stats.todayAppointments} />
        <StatCard label="در انتظار تأیید" value={stats.pendingAppointments} />
        <StatCard
          label="درآمد کل"
          value={`${stats.totalRevenue.toLocaleString("fa-IR")} تومان`}
        />
        <StatCard label="سرویس‌های فعال" value={stats.activeServices} />
      </div>

      <SurfaceCard>
        <div className="mb-[var(--space-sm)] flex items-center justify-between gap-[var(--space-xs)]">
          <h2 className="text-[var(--text-lg)] font-semibold text-[var(--color-ink)]">
            آخرین نوبت‌ها
          </h2>
          <Link
            href="/admin/appointments"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            مشاهده همه
          </Link>
        </div>

        {stats.recentAppointments.length === 0 ? (
          <EmptyState title="هنوز نوبتی ثبت نشده است" />
        ) : (
          <div className="space-y-[var(--space-xs)]">
            {stats.recentAppointments.map((appt) => {
              const status = getAppointmentStatus(appt.status);
              return (
                <div
                  key={appt.id}
                  className="flex items-center justify-between gap-[var(--space-sm)] rounded-[var(--radius-input)] border border-[var(--color-rule)] p-[var(--space-sm)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-paper-3)] text-sm font-bold text-[var(--color-ink-2)]"
                      aria-hidden="true"
                    >
                      {appt.user.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                        {appt.user.name}
                      </p>
                      <p className="truncate text-xs text-[var(--color-ink-muted)]">
                        {appt.barber.user.name} · {formatFaDate(appt.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-[var(--color-ink-2)]">
                      {appt.startTime}
                    </span>
                    <StatusBadge
                      label={status.label}
                      bgVar={status.bgVar}
                      fgVar={status.fgVar}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
