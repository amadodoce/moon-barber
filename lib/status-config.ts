export type StatusKey =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface StatusStyle {
  label: string;
  bgVar: string;
  fgVar: string;
}

export const appointmentStatusConfig: Record<string, StatusStyle> = {
  PENDING: {
    label: "در انتظار",
    bgVar: "var(--status-pending-bg)",
    fgVar: "var(--status-pending-fg)",
  },
  CONFIRMED: {
    label: "تأیید شده",
    bgVar: "var(--status-confirmed-bg)",
    fgVar: "var(--status-confirmed-fg)",
  },
  CANCELLED: {
    label: "لغو شده",
    bgVar: "var(--status-cancelled-bg)",
    fgVar: "var(--status-cancelled-fg)",
  },
  COMPLETED: {
    label: "انجام شد",
    bgVar: "var(--status-completed-bg)",
    fgVar: "var(--status-completed-fg)",
  },
  NO_SHOW: {
    label: "عدم حضور",
    bgVar: "var(--status-cancelled-bg)",
    fgVar: "var(--status-cancelled-fg)",
  },
};

export const paymentStatusConfig: Record<string, StatusStyle> = {
  PENDING: {
    label: "در انتظار پرداخت",
    bgVar: "var(--status-pending-bg)",
    fgVar: "var(--status-pending-fg)",
  },
  PAID: {
    label: "پرداخت شده",
    bgVar: "var(--status-paid-bg)",
    fgVar: "var(--status-paid-fg)",
  },
  FAILED: {
    label: "ناموفق",
    bgVar: "var(--status-failed-bg)",
    fgVar: "var(--status-failed-fg)",
  },
  REFUNDED: {
    label: "بازپرداخت",
    bgVar: "var(--status-completed-bg)",
    fgVar: "var(--status-completed-fg)",
  },
};

export function getAppointmentStatus(status: string): StatusStyle {
  return (
    appointmentStatusConfig[status] ?? {
      label: status,
      bgVar: "var(--color-paper-3)",
      fgVar: "var(--color-ink-2)",
    }
  );
}

export function getPaymentStatus(status: string): StatusStyle {
  return (
    paymentStatusConfig[status] ?? {
      label: status,
      bgVar: "var(--color-paper-3)",
      fgVar: "var(--color-ink-2)",
    }
  );
}
