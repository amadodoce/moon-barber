import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Clock, CreditCard, Scissors } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 text-yellow-700" },
  CONFIRMED: { label: "تایید شده", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "انجام شده", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "عدم حضور", color: "bg-zinc-100 text-zinc-700" },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  const user = session.user as { id: string; name: string | null };

  const appointments = await prisma.appointment.findMany({
    where: { userId: user.id, deletedAt: null },
    include: {
      barber: {
        include: { user: { select: { name: true } } },
      },
      appointmentServices: {
        include: { service: { select: { name: true } } },
      },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
    take: 20,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-zinc-100">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-bold text-zinc-900">نوبت‌های من</h1>
          <Link
            href="/book"
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            رزرو جدید
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="mb-4 text-sm text-zinc-500">
          سلام {user.name ?? "کاربر عزیز"} 👋
        </p>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <Calendar className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-zinc-500">هنوز نوبتی رزرو نکرده‌اید</p>
            <Link
              href="/book"
              className="mt-4 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              رزرو اولین نوبت
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const st = statusConfig[appt.status] ?? {
                label: appt.status,
                color: "bg-zinc-100",
              };
              const totalAmount = appt.appointmentServices.reduce(
                (sum, as) => sum + Number(as.priceAtBooking),
                0
              );

              return (
                <div
                  key={appt.id}
                  className="rounded-2xl bg-white border border-zinc-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-zinc-900">
                          {appt.appointmentServices
                            .map((as) => as.service.name)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(appt.date).toLocaleDateString("fa-IR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {appt.startTime} - {appt.endTime}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        آرایشگر: {appt.barber.user.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  {appt.payment && (
                    <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
                      <span className="flex items-center gap-1 text-zinc-500">
                        <CreditCard className="h-3.5 w-3.5" />
                        {appt.payment.status === "PAID"
                          ? "پرداخت شده"
                          : "در انتظار پرداخت"}
                      </span>
                      <span className="font-medium text-amber-600">
                        {totalAmount.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
