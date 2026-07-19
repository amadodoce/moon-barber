"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, UserX } from "lucide-react";
import { getBarberAppointments, updateAppointmentStatus } from "@/app/actions/appointment";
import { Spinner } from "@/components/ui/Spinner";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { getTodayLocalDateString, toLocalDateString } from "@/lib/dates";

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  user: { name: string; phone: string };
  appointmentServices: Array<{
    service: { name: string };
  }>;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  CONFIRMED: { label: "تایید شده", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  COMPLETED: { label: "انجام شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  NO_SHOW: { label: "عدم حضور", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

export default function BarberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/barber");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void (async () => {
      const result = await getBarberAppointments();
      if (result.success) {
        setAppointments((result.data ?? []) as unknown as Appointment[]);
      }
      setLoading(false);
    })();
  }, [status]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    const result = await updateAppointmentStatus({ id, status: newStatus as "COMPLETED" | "NO_SHOW" });
    if (!result.success) {
      showError(result.error || "خطا در بروزرسانی");
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      showSuccess("وضعیت بروزرسانی شد");
    }
    setUpdating(null);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen min-h-dvh bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session?.user) return null;

  const today = getTodayLocalDateString();
  const todayAppointments = appointments.filter(
    (a) => toLocalDateString(new Date(a.date)) === today
  );
  const upcomingAppointments = appointments.filter(
    (a) => toLocalDateString(new Date(a.date)) > today
  );

  return (
    <div className="min-h-screen min-h-dvh bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-700">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">پنل آرایشگر</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          سلام {session.user.name ?? "آرایشگر عزیز"} 👋
        </p>

        {/* Today's appointments */}
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            نوبت‌های امروز
          </h2>
          {todayAppointments.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <Calendar className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                امروز نوبتی ندارید
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <BarberAppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onStatusChange={handleStatusChange}
                  updating={updating === appt.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming appointments */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            نوبت‌های آینده
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500" />
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                نوبت آینده‌ای ندارید
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <BarberAppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onStatusChange={handleStatusChange}
                  updating={updating === appt.id}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BarberAppointmentCard({
  appointment,
  onStatusChange,
  updating,
}: {
  appointment: Appointment;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
}) {
  const st = statusConfig[appointment.status] ?? {
    label: appointment.status,
    color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300",
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {appointment.user.name}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
              {st.label}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {appointment.appointmentServices.map((as) => as.service.name).join(", ")}
          </p>
        </div>
        {appointment.status === "CONFIRMED" && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "COMPLETED")}
              disabled={updating}
              className="h-7 text-xs"
            >
              <CheckCircle className="ml-1 h-3.5 w-3.5 text-green-500" />
              انجام شد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "NO_SHOW")}
              disabled={updating}
              className="h-7 text-xs"
            >
              <UserX className="ml-1 h-3.5 w-3.5 text-red-500" />
              عدم حضور
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
