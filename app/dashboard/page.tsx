"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { getMyAppointments } from "@/app/actions/appointment";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { Spinner } from "@/components/ui/Spinner";
import { useEffect } from "react";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void (async () => {
      const result = await getMyAppointments();
      if (result.success) {
        setAppointments((result.data ?? []) as unknown as Appointment[]);
      }
      setLoading(false);
    })();
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen min-h-dvh bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
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

  return (
    <div className="min-h-screen min-h-dvh bg-zinc-50 dark:bg-zinc-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-700">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">نوبت‌های من</h1>
          <Link
            href="/book"
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
          >
            رزرو جدید
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          سلام {user.name ?? "کاربر عزیز"}.
        </p>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Calendar className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">هنوز نوبتی رزرو نکرده‌اید</p>
            <Link
              href="/book"
              className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold transition-colors hover:opacity-90"
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
      </main>
    </div>
  );
}
