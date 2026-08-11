"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle,
  UserX,
  Phone,
  AlertCircle,
} from "lucide-react";
import { getBarberAppointments, updateAppointmentStatus } from "@/app/actions/appointment";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/brand/EmptyState";
import { StatCard } from "@/components/brand/StatCard";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { SurfaceCard } from "@/components/brand/SurfaceCard";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/lib/toast";
import { getTodayLocalDateString, toLocalDateString, formatFaDate } from "@/lib/dates";
import { getAppointmentStatus } from "@/lib/status-config";
import { cn } from "@/lib/utils";

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

type View = "today" | "upcoming" | "needs-action";

export default function BarberDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("today");

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
        setFetchError(null);
      } else {
        setFetchError(result.error || "خطا در بارگذاری نوبت‌ها");
      }
      setLoading(false);
    })();
  }, [status]);

  const handleRetry = () => {
    setLoading(true);
    setFetchError(null);
    void (async () => {
      const result = await getBarberAppointments();
      if (result.success) {
        setAppointments((result.data ?? []) as unknown as Appointment[]);
      } else {
        setFetchError(result.error || "خطا در بارگذاری نوبت‌ها");
      }
      setLoading(false);
    })();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    const result = await updateAppointmentStatus({
      id,
      status: newStatus as "COMPLETED" | "NO_SHOW",
    });
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

  if (status === "loading" || (loading && !fetchError)) {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)]">
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
  const needsActionAppointments = appointments.filter(
    (a) =>
      a.status === "CONFIRMED" &&
      toLocalDateString(new Date(a.date)) <= today
  );

  const viewConfig: Record<
    View,
    { label: string; items: Appointment[]; emptyTitle: string; emptyIcon: ReactNode }
  > = {
    today: {
      label: "امروز",
      items: todayAppointments,
      emptyTitle: "امروز نوبتی ندارید",
      emptyIcon: <Calendar className="h-8 w-8" />,
    },
    upcoming: {
      label: "آینده",
      items: upcomingAppointments,
      emptyTitle: "نوبت آینده‌ای ندارید",
      emptyIcon: <Clock className="h-8 w-8" />,
    },
    "needs-action": {
      label: "نیاز به اقدام",
      items: needsActionAppointments,
      emptyTitle: "نوبتی برای اقدام ندارید",
      emptyIcon: <CheckCircle className="h-8 w-8" />,
    },
  };

  const currentView = viewConfig[activeView];

  return (
    <DashboardShell
      title="پنل آرایشگر"
      greeting={`سلام ${session.user.name ?? "آرایشگر عزیز"}.`}
    >
      {fetchError ? (
        <div className="mb-[var(--space-md)] space-y-[var(--space-sm)]">
          <ErrorMessage message={fetchError} />
          <Button variant="outline" onClick={handleRetry}>
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      <div className="mb-[var(--space-md)] grid grid-cols-2 gap-[var(--space-sm)]">
        <StatCard
          label="نوبت امروز"
          value={todayAppointments.length.toLocaleString("fa-IR")}
        />
        <StatCard
          label="نیاز به اقدام"
          value={needsActionAppointments.length.toLocaleString("fa-IR")}
        />
      </div>

      <div
        className="mb-[var(--space-md)] flex gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-1"
        role="tablist"
        aria-label="نمایش نوبت‌ها"
      >
        {(Object.keys(viewConfig) as View[]).map((view) => (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={activeView === view}
            onClick={() => setActiveView(view)}
            className={cn(
              "min-h-11 flex-1 rounded-[var(--radius-input)] px-2 py-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm",
              activeView === view
                ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            {viewConfig[view].label}
            {view === "needs-action" && needsActionAppointments.length > 0 ? (
              <span className="ms-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--status-pending-bg)] px-1 text-[0.65rem] text-[var(--status-pending-fg)]">
                {needsActionAppointments.length.toLocaleString("fa-IR")}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {currentView.items.length === 0 ? (
          <EmptyState
            icon={currentView.emptyIcon}
            title={currentView.emptyTitle}
          />
        ) : (
          <div className="space-y-[var(--space-sm)]">
            {currentView.items.map((appt) => (
              <BarberAppointmentCard
                key={appt.id}
                appointment={appt}
                onStatusChange={handleStatusChange}
                updating={updating === appt.id}
                showDate={activeView !== "today"}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function BarberAppointmentCard({
  appointment,
  onStatusChange,
  updating,
  showDate,
}: {
  appointment: Appointment;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
  showDate?: boolean;
}) {
  const st = getAppointmentStatus(appointment.status);
  const services = appointment.appointmentServices
    .map((as) => as.service.name)
    .join(" · ");

  return (
    <SurfaceCard padding="md">
      <div className="flex items-start justify-between gap-[var(--space-sm)]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {appointment.user.name}
            </span>
            <StatusBadge label={st.label} bgVar={st.bgVar} fgVar={st.fgVar} />
          </div>

          <a
            href={`tel:${appointment.user.phone}`}
            className="mt-1.5 inline-flex min-h-11 items-center gap-1.5 text-xs text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            <span dir="ltr">{appointment.user.phone}</span>
          </a>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-muted)]">
            {showDate ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatFaDate(appointment.date)}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {appointment.startTime} - {appointment.endTime}
            </span>
          </div>

          {services ? (
            <p className="mt-1 text-xs text-[var(--color-ink-faint)]">{services}</p>
          ) : null}
        </div>

        {appointment.status === "CONFIRMED" &&
        toLocalDateString(new Date(appointment.date)) <= getTodayLocalDateString() ? (
          <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "COMPLETED")}
              disabled={updating}
              className="gap-1 text-xs"
            >
              <CheckCircle className="h-3.5 w-3.5 text-[var(--status-paid-fg)]" />
              انجام شد
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "NO_SHOW")}
              disabled={updating}
              className="gap-1 text-xs"
            >
              <UserX className="h-3.5 w-3.5 text-[var(--status-cancelled-fg)]" />
              عدم حضور
            </Button>
          </div>
        ) : appointment.status === "CONFIRMED" ? (
          <span
            className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)]"
            title="اقدام پس از روز نوبت"
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">منتظر روز نوبت</span>
          </span>
        ) : null}
      </div>
    </SurfaceCard>
  );
}
