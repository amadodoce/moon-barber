"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, CreditCard, Clock, Scissors } from "lucide-react";
import { getMyAppointments } from "@/app/actions/appointment";
import { getMyPayments } from "@/app/actions/payment";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmptyState } from "@/components/brand/EmptyState";
import { StatCard } from "@/components/brand/StatCard";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { SurfaceCard } from "@/components/brand/SurfaceCard";
import { Spinner } from "@/components/ui/Spinner";
import { formatFaDate } from "@/lib/dates";
import { getPaymentStatus } from "@/lib/status-config";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  appointmentServices: Array<{
    service: { name: string };
    priceAtBooking: unknown;
  }>;
  barber: { user: { name: string } };
  payment?: { status: string; amount: unknown } | null;
}

interface Payment {
  id: string;
  amount: unknown;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  appointment: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    barber: { user: { name: string } };
    appointmentServices: Array<{
      service: { name: string; durationMinutes: number };
      priceAtBooking: unknown;
    }>;
  };
}

type Tab = "appointments" | "payments";

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("appointments");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/customer");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void (async () => {
      const [apptResult, paymentResult] = await Promise.all([
        getMyAppointments(),
        getMyPayments(),
      ]);
      if (apptResult.success) {
        setAppointments((apptResult.data ?? []) as unknown as Appointment[]);
      }
      if (paymentResult.success) {
        setPayments((paymentResult.data ?? []) as unknown as Payment[]);
      }
      setLoading(false);
    })();
  }, [status]);

  const handleCancel = useCallback(async (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
    );
    setPayments((prev) =>
      prev.map((p) =>
        p.appointment.id === id && p.status === "PENDING"
          ? { ...p, status: "FAILED" }
          : p
      )
    );
    const paymentResult = await getMyPayments();
    if (paymentResult.success) {
      setPayments((paymentResult.data ?? []) as unknown as Payment[]);
    }
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as { name: string | null };

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <DashboardShell
      title="داشبورد"
      greeting={`سلام ${user.name ?? "کاربر عزیز"}.`}
      cta={{ label: "رزرو جدید", href: "/book" }}
    >
      <div className="mb-[var(--space-md)] grid grid-cols-2 gap-[var(--space-sm)]">
        <StatCard label="نوبت کل" value={appointments.length.toLocaleString("fa-IR")} />
        <StatCard
          label="تومان پرداخت شده"
          value={totalPaid.toLocaleString("fa-IR")}
        />
      </div>

      <div
        className="mb-[var(--space-md)] flex gap-1 rounded-[var(--radius-input)] border border-[var(--color-rule)] bg-[var(--color-paper-2)] p-1"
        role="tablist"
        aria-label="بخش‌های داشبورد"
      >
        {(
          [
            { id: "appointments" as const, label: "نوبت‌ها" },
            { id: "payments" as const, label: "پرداخت‌ها" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "min-h-11 flex-1 rounded-[var(--radius-input)] px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "appointments" && (
        <div id="panel-appointments" role="tabpanel" aria-labelledby="tab-appointments">
          {appointments.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8" />}
              title="هنوز نوبتی رزرو نکرده‌اید"
              description="اولین نوبت خود را همین حالا رزرو کنید."
              action={{ label: "رزرو اولین نوبت", href: "/book" }}
            />
          ) : (
            <div className="space-y-[var(--space-sm)]">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onCancel={() => void handleCancel(appt.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div id="panel-payments" role="tabpanel" aria-labelledby="tab-payments">
          {payments.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="h-8 w-8" />}
              title="هنوز پرداختی انجام نداده‌اید"
              description="پس از رزرو و پرداخت، جزئیات اینجا نمایش داده می‌شود."
            />
          ) : (
            <div className="space-y-[var(--space-sm)]">
              {payments.map((payment) => {
                const ps = getPaymentStatus(payment.status);
                return (
                  <SurfaceCard key={payment.id} padding="md">
                    <div className="flex items-center justify-between gap-[var(--space-sm)]">
                      <div className="flex min-w-0 items-center gap-2">
                        <CreditCard
                          className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-semibold text-[var(--color-ink)]">
                          {Number(payment.amount).toLocaleString("fa-IR")} تومان
                        </span>
                      </div>
                      <StatusBadge
                        label={ps.label}
                        bgVar={ps.bgVar}
                        fgVar={ps.fgVar}
                      />
                    </div>

                    <div className="mt-[var(--space-sm)] rounded-[var(--radius-input)] bg-[var(--color-paper)] p-[var(--space-sm)]">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-ink-muted)]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {formatFaDate(payment.appointment.date)}
                        </span>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {payment.appointment.startTime} - {payment.appointment.endTime}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                        <Scissors
                          className="h-3.5 w-3.5 text-[var(--color-accent)]"
                          aria-hidden="true"
                        />
                        <span>آرایشگر: {payment.appointment.barber.user.name}</span>
                      </div>
                    </div>

                    {payment.appointment.appointmentServices.length > 0 && (
                      <div className="mt-[var(--space-sm)] space-y-1.5">
                        {payment.appointment.appointmentServices.map((as, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-[var(--color-ink-2)]">
                              {as.service.name}
                            </span>
                            <span className="text-[var(--color-ink-muted)]">
                              {as.service.durationMinutes} دقیقه •{" "}
                              {Number(as.priceAtBooking).toLocaleString("fa-IR")} تومان
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-[var(--space-sm)] flex items-center justify-between border-t border-[var(--color-rule)] pt-[var(--space-sm)] text-xs text-[var(--color-ink-faint)]">
                      <span>کد پرداخت: {payment.id.slice(-8).toUpperCase()}</span>
                      <span>
                        {payment.paidAt
                          ? `پرداخت: ${formatFaDate(payment.paidAt)}`
                          : `ثبت: ${formatFaDate(payment.createdAt)}`}
                      </span>
                    </div>
                  </SurfaceCard>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
