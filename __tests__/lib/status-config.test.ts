import { describe, it, expect } from "vitest";
import {
  getAppointmentStatus,
  getPaymentStatus,
  appointmentStatusConfig,
  paymentStatusConfig,
} from "@/lib/status-config";

describe("status-config", () => {
  it("returns known appointment status labels", () => {
    expect(getAppointmentStatus("CONFIRMED").label).toBe("تأیید شده");
    expect(getAppointmentStatus("PENDING").label).toBe("در انتظار");
  });

  it("returns fallback for unknown appointment status", () => {
    const result = getAppointmentStatus("UNKNOWN");
    expect(result.label).toBe("UNKNOWN");
    expect(result.bgVar).toBe("var(--color-paper-3)");
  });

  it("returns known payment status labels", () => {
    expect(getPaymentStatus("PAID").label).toBe("پرداخت شده");
    expect(getPaymentStatus("FAILED").label).toBe("ناموفق");
  });

  it("covers all appointment statuses", () => {
    expect(Object.keys(appointmentStatusConfig)).toEqual(
      expect.arrayContaining(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
    );
  });

  it("covers all payment statuses", () => {
    expect(Object.keys(paymentStatusConfig)).toEqual(
      expect.arrayContaining(["PENDING", "PAID", "FAILED", "REFUNDED"])
    );
  });
});
