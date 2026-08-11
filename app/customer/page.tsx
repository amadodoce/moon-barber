"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, CreditCard, Scissors, LogOut, Clock } from "lucide-react";
import Link from "next/link";
import { getMyAppointments } from "@/app/actions/appointment";
import { getMyPayments } from "@/app/actions/payment";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { Spinner } from "@/components/ui/Spinner";
import { signOut } from "next-auth/react";
import { formatFaDate } from "@/lib/dates";

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

const paymentStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PAID: { label: "پرداخت شده", bg: "color-mix(in srgb, #22c55e 12%, transparent)", text: "#22c55e" },
  PENDING: { label: "در انتظار", bg: "color-mix(in srgb, #eab308 12%, transparent)", text: "#eab308" },
  FAILED: { label: "ناموفق", bg: "color-mix(in srgb, #ef4444 12%, transparent)", text: "#ef4444" },
  REFUNDED: { label: "بازپرداخت", bg: "color-mix(in srgb, #3b82f6 12%, transparent)", text: "#3b82f6" },
};

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"appointments" | "payments">("appointments");

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

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center" style={{ backgroundColor: "var(--surface-base)" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as { name: string | null };

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
    );
  };

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

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
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>داشبورد</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/book"
              className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            >
              رزرو جدید
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg p-2 transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Greeting */}
        <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          سلام {user.name ?? "کاربر عزیز"}.
        </p>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
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
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{appointments.length}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>نوبت کل</p>
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
                style={{ backgroundColor: "color-mix(in srgb, #22c55e 12%, transparent)" }}
              >
                <CreditCard className="h-5 w-5" style={{ color: "#22c55e" }} />
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {totalPaid.toLocaleString("fa-IR")}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>تومان پرداخت شده</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="mb-4 flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: "var(--surface-overlay)" }}
          role="tablist"
          aria-label="بخش‌های داشبورد"
        >
          <button
            type="button"
            role="tab"
            id="tab-appointments"
            aria-selected={activeTab === "appointments"}
            aria-controls="panel-appointments"
            onClick={() => setActiveTab("appointments")}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={activeTab === "appointments"
              ? { backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }
              : { color: "var(--text-secondary)" }
            }
          >
            نوبت‌ها
          </button>
          <button
            type="button"
            role="tab"
            id="tab-payments"
            aria-selected={activeTab === "payments"}
            aria-controls="panel-payments"
            onClick={() => setActiveTab("payments")}
            className="flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={activeTab === "payments"
              ? { backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }
              : { color: "var(--text-secondary)" }
            }
          >
            پرداخت‌ها
          </button>
        </div>

        {/* Appointments tab */}
        {activeTab === "appointments" && (
          <div id="panel-appointments" role="tabpanel" aria-labelledby="tab-appointments">
            {appointments.length === 0 ? (
              <div
                className="rounded-xl border p-8 text-center"
                style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
              >
                <Calendar className="mx-auto h-8 w-8" style={{ color: "var(--text-faint)" }} />
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  هنوز نوبتی رزرو نکرده‌اید
                </p>
                <Link
                  href="/book"
                  className="mt-4 inline-block rounded-lg px-5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
                >
                  رزرو اولین نوبت
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onCancel={() => handleCancel(appt.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments tab */}
        {activeTab === "payments" && (
          <div id="panel-payments" role="tabpanel" aria-labelledby="tab-payments">
            {payments.length === 0 ? (
              <div
                className="rounded-xl border p-8 text-center"
                style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
              >
                <CreditCard className="mx-auto h-8 w-8" style={{ color: "var(--text-faint)" }} />
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  هنوز پرداختی انجام نداده‌اید
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => {
                  const ps = paymentStatusConfig[payment.status] ?? {
                    label: payment.status,
                    bg: "color-mix(in srgb, #71717a 12%, transparent)",
                    text: "#71717a",
                  };
                  return (
                    <div
                      key={payment.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
                    >
                      {/* Header: amount + status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 shrink-0" style={{ color: "var(--booking-gold)" }} />
                          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                            {Number(payment.amount).toLocaleString("fa-IR")} تومان
                          </span>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: ps.bg, color: ps.text }}
                        >
                          {ps.label}
                        </span>
                      </div>

                      {/* Appointment details */}
                      <div
                        className="mt-3 rounded-lg p-3"
                        style={{ backgroundColor: "var(--surface-base)" }}
                      >
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatFaDate(payment.appointment.date)}</span>
                          <span>•</span>
                          <Clock className="h-3.5 w-3.5" />
                          <span>{payment.appointment.startTime} - {payment.appointment.endTime}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Scissors className="h-3.5 w-3.5" style={{ color: "var(--booking-gold)" }} />
                          <span>آرایشگر: {payment.appointment.barber.user.name}</span>
                        </div>
                      </div>

                      {/* Services list */}
                      {payment.appointment.appointmentServices.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {payment.appointment.appointmentServices.map((as, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span style={{ color: "var(--text-secondary)" }}>{as.service.name}</span>
                              <span style={{ color: "var(--text-muted)" }}>
                                {as.service.durationMinutes} دقیقه • {Number(as.priceAtBooking).toLocaleString("fa-IR")} تومان
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer: payment ID + date */}
                      <div
                        className="mt-3 flex items-center justify-between border-t pt-3 text-xs"
                        style={{ borderColor: "var(--surface-border)" }}
                      >
                        <span style={{ color: "var(--text-faint)" }}>
                          کد پرداخت: {payment.id.slice(-8).toUpperCase()}
                        </span>
                        <span style={{ color: "var(--text-faint)" }}>
                          {payment.paidAt
                            ? `پرداخت: ${formatFaDate(payment.paidAt)}`
                            : `ثبت: ${formatFaDate(payment.createdAt)}`
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
