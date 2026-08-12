import { describe, it, expect } from "vitest";
import { createWorkingHourSchema } from "@/lib/validations/working-hour";
import { createHolidaySchema } from "@/lib/validations/holiday";
import { createAppointmentSchema } from "@/lib/validations/appointment";
import { getTehranTodayString } from "@/lib/booking/timezone";

describe("createWorkingHourSchema", () => {
  it("rejects end before start", () => {
    const result = createWorkingHourSchema.safeParse({
      dayOfWeek: "SATURDAY",
      startTime: "12:00",
      endTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid range", () => {
    const result = createWorkingHourSchema.safeParse({
      dayOfWeek: "SATURDAY",
      startTime: "09:00",
      endTime: "12:00",
    });
    expect(result.success).toBe(true);
  });
});

describe("createHolidaySchema", () => {
  it("requires times for TIME_RANGE", () => {
    const result = createHolidaySchema.safeParse({
      title: "تعطیل",
      date: "2026-08-15",
      type: "TIME_RANGE",
    });
    expect(result.success).toBe(false);
  });

  it("accepts FULL_DAY without times", () => {
    const result = createHolidaySchema.safeParse({
      title: "تعطیل",
      date: "2026-08-15",
      type: "FULL_DAY",
    });
    expect(result.success).toBe(true);
  });
});

describe("createAppointmentSchema", () => {
  it("rejects past dates", () => {
    const result = createAppointmentSchema.safeParse({
      barberId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      serviceIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx"],
      date: "2020-01-01",
      startTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("accepts today or future", () => {
    const today = getTehranTodayString();
    const result = createAppointmentSchema.safeParse({
      barberId: "clxxxxxxxxxxxxxxxxxxxxxxxxx",
      serviceIds: ["clxxxxxxxxxxxxxxxxxxxxxxxxx"],
      date: today,
      startTime: "09:00",
    });
    expect(result.success).toBe(true);
  });
});
