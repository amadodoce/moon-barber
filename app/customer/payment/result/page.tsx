import { Suspense } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Scissors,
  Info,
} from "lucide-react";
import { ResetBookingOnPaymentSuccess } from "@/components/book/ResetBookingOnPaymentSuccess";
import { SurfaceCard } from "@/components/brand/SurfaceCard";
import { Button } from "@/components/ui/button";
import { getMyAppointments } from "@/app/actions/appointment";
import { formatFaDate } from "@/lib/dates";
import { PaymentRetryButton } from "@/components/customer/PaymentRetryButton";

interface PaymentResultProps {
  searchParams: Promise<{ status?: string; appointmentId?: string }>;
}

interface AppointmentContext {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  barber: { user: { name: string } };
  appointmentServices: Array<{ service: { name: string } }>;
}

async function loadAppointmentContext(
  appointmentId: string
): Promise<AppointmentContext | null> {
  const result = await getMyAppointments();
  if (!result.success || !result.data) return null;
  const match = result.data.find((a) => a.id === appointmentId);
  if (!match) return null;
  return match as unknown as AppointmentContext;
}

function AppointmentContextCard({
  appointment,
}: {
  appointment: AppointmentContext;
}) {
  const services = appointment.appointmentServices
    .map((as) => as.service.name)
    .join(" · ");

  return (
    <SurfaceCard padding="md" className="mt-[var(--space-md)] text-start">
      <p className="mb-[var(--space-sm)] text-xs font-medium text-[var(--color-ink-muted)]">
        جزئیات نوبت
      </p>
      {services ? (
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
          <Scissors className="h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
          <span>{services}</span>
        </div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-ink-muted)]">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {formatFaDate(appointment.date)}
        </span>
        <span aria-hidden="true">•</span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {appointment.startTime} - {appointment.endTime}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
        آرایشگر: {appointment.barber.user.name}
      </p>
    </SurfaceCard>
  );
}

function ResultActions({
  appointmentId,
  primaryLabel,
  showRetry = true,
}: {
  appointmentId?: string;
  primaryLabel?: string;
  showRetry?: boolean;
}) {
  return (
    <div className="mt-[var(--space-lg)] space-y-[var(--space-sm)]">
      {showRetry && appointmentId ? (
        <PaymentRetryButton appointmentId={appointmentId} label={primaryLabel} />
      ) : (
        <Button variant="brand" className="w-full" render={<Link href="/book" />}>
          {primaryLabel ?? "رزرو مجدد"}
        </Button>
      )}
      <Button variant="outline" className="w-full" render={<Link href="/customer" />}>
        نوبت‌های من
      </Button>
      <Button variant="ghost" className="w-full" render={<Link href="/" />}>
        بازگشت به صفحه اصلی
      </Button>
    </div>
  );
}

async function PaymentResultContent({ searchParams }: PaymentResultProps) {
  const params = await searchParams;
  const status = params.status || "error";
  const appointmentId = params.appointmentId;
  const appointment =
    appointmentId ? await loadAppointmentContext(appointmentId) : null;

  if (status === "success") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)] py-[var(--space-xl)]">
        <ResetBookingOnPaymentSuccess status={status} />
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-[var(--space-md)] flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-paid-bg)]">
            <CheckCircle className="h-10 w-10 text-[var(--status-paid-fg)]" />
          </div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
            پرداخت موفق
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            نوبت شما با موفقیت رزرو و پرداخت شد.
          </p>
          {appointment ? <AppointmentContextCard appointment={appointment} /> : null}
          <div className="mt-[var(--space-lg)] space-y-[var(--space-sm)]">
            <Button variant="brand" className="w-full" render={<Link href="/customer" />}>
              مشاهده نوبت‌ها
            </Button>
            <Button variant="outline" className="w-full" render={<Link href="/" />}>
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "late_paid") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)] py-[var(--space-xl)]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-[var(--space-md)] flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-pending-bg)]">
            <Info className="h-10 w-10 text-[var(--status-pending-fg)]" />
          </div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
            پرداخت ثبت شد — نیاز به پیگیری
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            مبلغ پرداخت شده است، اما نوبت به‌دلیل اتمام مهلت رزرو لغو شده بود. تیم پشتیبانی برای هماهنگی با شما تماس خواهد گرفت.
          </p>
          {appointment ? <AppointmentContextCard appointment={appointment} /> : null}
          <div className="mt-[var(--space-lg)] space-y-[var(--space-sm)]">
            <Button variant="brand" className="w-full" render={<Link href="/customer" />}>
              مشاهده وضعیت
            </Button>
            <Button variant="outline" className="w-full" render={<Link href="/" />}>
              بازگشت به صفحه اصلی
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)] py-[var(--space-xl)]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-[var(--space-md)] flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-pending-bg)]">
            <AlertTriangle className="h-10 w-10 text-[var(--status-pending-fg)]" />
          </div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
            پرداخت لغو شد
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            پرداخت در درگاه لغو شد. نوبت شما همچنان برای پرداخت باز است.
          </p>
          {appointment ? <AppointmentContextCard appointment={appointment} /> : null}
          <ResultActions appointmentId={appointmentId} primaryLabel="ادامه پرداخت" />
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)] py-[var(--space-xl)]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-[var(--space-md)] flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-failed-bg)]">
            <XCircle className="h-10 w-10 text-[var(--status-failed-fg)]" />
          </div>
          <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
            پرداخت ناموفق
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            تأیید پرداخت انجام نشد. می‌توانید دوباره تلاش کنید.
          </p>
          {appointment ? <AppointmentContextCard appointment={appointment} /> : null}
          <ResultActions appointmentId={appointmentId} primaryLabel="تلاش مجدد پرداخت" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)] px-[var(--space-md)] py-[var(--space-xl)]">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-[var(--space-md)] flex h-20 w-20 items-center justify-center rounded-full bg-[var(--status-pending-bg)]">
          <AlertTriangle className="h-10 w-10 text-[var(--status-pending-fg)]" />
        </div>
        <h1 className="text-[var(--text-2xl)] font-semibold text-[var(--color-ink)]">
          خطای پرداخت
        </h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          در پردازش پرداخت خطایی رخ داده است. لطفاً دوباره تلاش کنید.
        </p>
        {appointment ? <AppointmentContextCard appointment={appointment} /> : null}
        <ResultActions appointmentId={appointmentId} primaryLabel="تلاش مجدد" />
      </div>
    </div>
  );
}

export default function PaymentResultPage(props: PaymentResultProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen min-h-dvh items-center justify-center bg-[var(--color-paper)]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-accent)] border-t-transparent" />
        </div>
      }
    >
      <PaymentResultContent searchParams={props.searchParams} />
    </Suspense>
  );
}
