"use client";

import { useState } from "react";
import { Calendar, Clock, CreditCard, Scissors, X } from "lucide-react";
import { cancelAppointment } from "@/app/actions/appointment";
import { showSuccess, showError } from "@/lib/toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/brand/StatusBadge";
import { SurfaceCard } from "@/components/brand/SurfaceCard";
import { Button } from "@/components/ui/button";
import { formatFaDate } from "@/lib/dates";
import {
  getAppointmentStatus,
  getPaymentStatus,
} from "@/lib/status-config";

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

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const appointmentStatus = getAppointmentStatus(appointment.status);

  const totalAmount = appointment.appointmentServices.reduce(
    (sum, as) => sum + Number(as.priceAtBooking),
    0
  );

  const canCancel =
    appointment.status === "PENDING" || appointment.status === "CONFIRMED";

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

  const paymentStatus = appointment.payment
    ? getPaymentStatus(appointment.payment.status)
    : null;

  return (
    <>
      <SurfaceCard padding="md">
        <div className="flex items-start justify-between gap-[var(--space-sm)]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Scissors
                className="h-4 w-4 shrink-0 text-[var(--color-accent)]"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-[var(--color-ink)]">
                {appointment.appointmentServices
                  .map((as) => as.service.name)
                  .join(" · ")}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-ink-muted)]">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatFaDate(appointment.date)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
              آرایشگر: {appointment.barber.user.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge
              label={appointmentStatus.label}
              bgVar={appointmentStatus.bgVar}
              fgVar={appointmentStatus.fgVar}
            />
            {canCancel ? (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowConfirm(true)}
                aria-label="لغو نوبت"
                className="text-[var(--color-ink-faint)] hover:bg-[var(--status-cancelled-bg)] hover:text-[var(--status-cancelled-fg)]"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {appointment.payment && paymentStatus ? (
          <div className="mt-[var(--space-sm)] flex items-center justify-between border-t border-[var(--color-rule)] pt-[var(--space-sm)] text-xs">
            <span className="inline-flex items-center gap-1 text-[var(--color-ink-muted)]">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              <StatusBadge
                label={paymentStatus.label}
                bgVar={paymentStatus.bgVar}
                fgVar={paymentStatus.fgVar}
              />
            </span>
            <span className="font-medium text-[var(--color-accent)]">
              {totalAmount.toLocaleString("fa-IR")} تومان
            </span>
          </div>
        ) : null}
      </SurfaceCard>

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
