type PaymentLogContext = {
  appointmentId?: string;
  paymentId?: string;
  attemptId?: string;
  authority?: string;
  gatewayCode?: number;
  status?: string;
  errorKind?: string;
};

export function logPaymentEvent(
  event: string,
  context: PaymentLogContext = {}
): void {
  const payload = {
    event,
    ts: new Date().toISOString(),
    ...context,
  };
  console.info("[payment]", JSON.stringify(payload));
}
