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

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  CONFIRMED: { label: "تایید شده", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  COMPLETED: { label: "انجام شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  NO_SHOW: { label: "عدم حضور", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

export function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const st = statusConfig[appointment.status] ?? {
    label: appointment.status,
    color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300",
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
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {appointment.appointmentServices
                  .map((as) => as.service.name)
                  .join(", ")}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatFaDate(appointment.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {appointment.startTime} - {appointment.endTime}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              آرایشگر: {appointment.barber.user.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}>
              {st.label}
            </span>
            {canCancel && (
              <button
                onClick={() => setShowConfirm(true)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                title="لغو نوبت"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {appointment.payment && (
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700 pt-3 text-xs">
            <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <CreditCard className="h-3.5 w-3.5" />
              {appointment.payment.status === "PAID"
                ? "پرداخت شده"
                : "در انتظار پرداخت"}
            </span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
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
