"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, CheckCircle, UserX, Scissors, LogOut } from "lucide-react";
import { getBarberAppointments, updateAppointmentStatus } from "@/app/actions/appointment";
import { Spinner } from "@/components/ui/Spinner";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { getTodayLocalDateString, toLocalDateString } from "@/lib/dates";
import { signOut } from "next-auth/react";

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

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "در انتظار", bg: "color-mix(in srgb, #eab308 12%, transparent)", text: "#eab308" },
  CONFIRMED: { label: "تایید شده", bg: "color-mix(in srgb, #3b82f6 12%, transparent)", text: "#3b82f6" },
  COMPLETED: { label: "انجام شده", bg: "color-mix(in srgb, #22c55e 12%, transparent)", text: "#22c55e" },
  CANCELLED: { label: "لغو شده", bg: "color-mix(in srgb, #ef4444 12%, transparent)", text: "#ef4444" },
  NO_SHOW: { label: "عدم حضور", bg: "color-mix(in srgb, #71717a 12%, transparent)", text: "#71717a" },
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
      <div className="flex min-h-screen min-h-dvh items-center justify-center" style={{ backgroundColor: "var(--surface-base)" }}>
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
    <div className="min-h-screen min-h-dvh" style={{ backgroundColor: "var(--surface-base)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{ borderColor: "var(--surface-border)", backgroundColor: "color-mix(in srgb, var(--surface-overlay) 80%, transparent)" }}
      >
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--booking-gold)" }}
            >
              <Scissors className="h-4 w-4" style={{ color: "var(--surface-base)" }} />
            </div>
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>پنل آرایشگر</h1>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Greeting */}
        <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          سلام {session.user.name ?? "آرایشگر عزیز"}.
        </p>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in srgb, #3b82f6 12%, transparent)" }}
              >
                <Calendar className="h-5 w-5" style={{ color: "#3b82f6" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{todayAppointments.length}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>نوبت امروز</p>
              </div>
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: "color-mix(in srgb, #eab308 12%, transparent)" }}
              >
                <Clock className="h-5 w-5" style={{ color: "#eab308" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{upcomingAppointments.length}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>نوبت آینده</p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's appointments */}
        <div className="mb-8">
          <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            نوبت‌های امروز
          </h2>
          {todayAppointments.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
            >
              <Calendar className="mx-auto h-8 w-8" style={{ color: "var(--text-faint)" }} />
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
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
          <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
            نوبت‌های آینده
          </h2>
          {upcomingAppointments.length === 0 ? (
            <div
              className="rounded-xl border p-8 text-center"
              style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
            >
              <Clock className="mx-auto h-8 w-8" style={{ color: "var(--text-faint)" }} />
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
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
    bg: "color-mix(in srgb, #71717a 12%, transparent)",
    text: "#71717a",
  };

  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {appointment.user.name}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: st.bg, color: st.text }}
            >
              {st.label}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
            {appointment.appointmentServices.map((as) => as.service.name).join(" · ")}
          </p>
        </div>
        {appointment.status === "CONFIRMED" && (
          <div className="flex gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "COMPLETED")}
              disabled={updating}
              className="h-7 gap-1 text-xs"
            >
              <CheckCircle className="h-3.5 w-3.5" style={{ color: "#22c55e" }} />
              انجام شد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "NO_SHOW")}
              disabled={updating}
              className="h-7 gap-1 text-xs"
            >
              <UserX className="h-3.5 w-3.5" style={{ color: "#ef4444" }} />
              عدم حضور
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
