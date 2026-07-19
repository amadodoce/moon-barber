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

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  CONFIRMED: { label: "تایید شده", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  COMPLETED: { label: "انجام شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  NO_SHOW: { label: "عدم حضور", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">داشبورد</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          label="نوبت‌های امروز"
          value={stats.todayAppointments}
          color="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Clock}
          label="در انتظار تایید"
          value={stats.pendingAppointments}
          color="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
        />
        <StatCard
          icon={CreditCard}
          label="درآمد کل"
          value={`${stats.totalRevenue.toLocaleString("fa-IR")} تومان`}
          color="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Scissors}
          label="سرویس‌های فعال"
          value={stats.activeServices}
          color="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Recent appointments */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          آخرین نوبت‌ها
        </h2>
        <div className="space-y-3">
          {stats.recentAppointments.map((appt) => {
            const status = statusLabels[appt.status] ?? {
              label: appt.status,
              color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300",
            };
            return (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-zinc-700/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    {appt.user.name?.charAt(0) ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {appt.user.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {appt.barber.user.name} •{" "}
                      {formatFaDate(appt.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    {appt.startTime}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
          {stats.recentAppointments.length === 0 && (
            <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 py-8">
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
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
