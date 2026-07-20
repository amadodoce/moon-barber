"use client";

import { useState } from "react";
import { Calendar, Clock, CreditCard, Scissors, X } from "lucide-react";
import { cancelAppointment } from "@/app/actions/appointment";
import { showSuccess, showError } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Loader2 } from "lucide-react";
import { formatFaDate } from "@/lib/dates";

interface AppointmentService {
  service: { name: string };
  priceAtBooking: unknown;
}

interface AppointmentCardProps {
  appointment: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: string;
    appointmentServices: AppointmentService[];
    barber: { user: { name: string } };
    payment?: { status: string; amount: unknown } | null;
  };
  onCancel?: () => void;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "در انتظار", bg: "color-mix(in srgb, #eab308 12%, transparent)", text: "#eab308" },
  CONFIRMED: { label: "تایید شده", bg: "color-mix(in srgb, #3b82f6 12%, transparent)", text: "#3b82f6" },
  COMPLETED: { label: "انجام شده", bg: "color-mix(in srgb, #22c55e 12%, transparent)", text: "#22c55e" },
  CANCELLED: { label: "لغو شده", bg: "color-mix(in srgb, #ef4444 12%, transparent)", text: "#ef4444" },
  NO_SHOW: { label: "عدم حضور", bg: "color-mix(in srgb, #71717a 12%, transparent)", text: "#71717a" },
};

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const st = statusConfig[appointment.status] ?? {
    label: appointment.status,
    bg: "color-mix(in srgb, #71717a 12%, transparent)",
    text: "#71717a",
  };

  const totalAmount = appointment.appointmentServices.reduce(
    (sum, as) => sum + Number(as.priceAtBooking),
    0
  );

  const canCancel = appointment.status === "PENDING" || appointment.status === "CONFIRMED";

  const handleCancel = async () => {
    setCancelling(true);
    const result = await cancelAppointment({ id: appointment.id });
    if (!result.success) {
      showError(result.error || "خطا در لغو نوبت");
    } else {
      showSuccess("نوبت لغو شد");
      onCancel?.();
    }
    setCancelling(false);
    setShowConfirm(false);
  };

  return (
    <>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-overlay)" }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 shrink-0" style={{ color: "var(--booking-gold)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {appointment.appointmentServices
                  .map((as) => as.service.name)
                  .join(" · ")}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatFaDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <p className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
              آرایشگر: {appointment.barber.user.name}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: st.bg, color: st.text }}
            >
              {st.label}
            </span>
            {canCancel && (
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500"
                style={{ color: "var(--text-faint)" }}
                title="لغو نوبت"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {appointment.payment && (
          <div
            className="mt-3 flex items-center justify-between border-t pt-3 text-xs"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <span className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
              <CreditCard className="h-3.5 w-3.5" />
              {appointment.payment.status === "PAID"
                ? "پرداخت شده"
                : "در انتظار پرداخت"}
            </span>
            <span className="font-medium" style={{ color: "var(--booking-gold)" }}>
              {totalAmount.toLocaleString("fa-IR")} تومان
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="لغو نوبت"
        description="آیا از لغو این نوبت اطمینان دارید؟"
        confirmLabel="لغو نوبت"
        onConfirm={handleCancel}
        loading={cancelling}
        variant="danger"
      />
    </>
  );
}
