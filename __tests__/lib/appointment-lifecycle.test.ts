import { describe, expect, it } from "vitest";
import { canBarberUpdateAppointmentStatus } from "@/lib/appointment-lifecycle";

describe("canBarberUpdateAppointmentStatus", () => {
  it("allows COMPLETED for own appointments", () => {
    expect(
      canBarberUpdateAppointmentStatus("barber-1", "barber-1", "COMPLETED")
    ).toBe(true);
  });

  it("allows NO_SHOW for own appointments", () => {
    expect(
      canBarberUpdateAppointmentStatus("barber-1", "barber-1", "NO_SHOW")
    ).toBe(true);
  });

  it("denies updates for another barber's appointments", () => {
    expect(
      canBarberUpdateAppointmentStatus("barber-1", "barber-2", "COMPLETED")
    ).toBe(false);
  });

  it("denies status changes outside COMPLETED and NO_SHOW", () => {
    expect(
      canBarberUpdateAppointmentStatus("barber-1", "barber-1", "CANCELLED")
    ).toBe(false);
  });
});
