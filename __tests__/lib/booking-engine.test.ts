import { describe, it, expect } from "vitest";
import {
  subtractMinuteRanges,
  generateSlots,
  computeDaySlots,
  workingHoursWouldOverlap,
  resolveWorkingHours,
} from "@/lib/booking/engine";
import type { WorkingHourRecord, HolidayRecord } from "@/lib/booking/types";

describe("booking engine", () => {
  const shopHours: WorkingHourRecord[] = [
    {
      barberId: null,
      dayOfWeek: "SATURDAY",
      startMinute: 9 * 60,
      endMinute: 12 * 60,
      isRecurring: true,
      specificDate: null,
      isActive: true,
    },
    {
      barberId: null,
      dayOfWeek: "SATURDAY",
      startMinute: 14 * 60,
      endMinute: 20 * 60,
      isRecurring: true,
      specificDate: null,
      isActive: true,
    },
  ];

  it("resolves shop-wide recurring hours", () => {
    const ranges = resolveWorkingHours(shopHours, "barber-1", "2026-08-15");
    expect(ranges).toHaveLength(2);
    expect(ranges[0].startMinute).toBe(540);
  });

  it("subtracts blocked ranges", () => {
    const result = subtractMinuteRanges(
      [{ startMinute: 540, endMinute: 1020 }],
      [{ startMinute: 720, endMinute: 780 }]
    );
    expect(result).toEqual([
      { startMinute: 540, endMinute: 720 },
      { startMinute: 780, endMinute: 1020 },
    ]);
  });

  it("generates 30-min slots every 15 min", () => {
    const slots = generateSlots([{ startMinute: 540, endMinute: 600 }], 30, 15);
    expect(slots).toHaveLength(3);
    expect(slots[0].startTime).toBe("09:00");
    expect(slots[0].endTime).toBe("09:30");
  });

  it("returns empty when full-day holiday", () => {
    const holidays: HolidayRecord[] = [
      {
        barberId: null,
        date: new Date("2026-08-15T00:00:00.000Z"),
        startMinute: null,
        endMinute: null,
        type: "FULL_DAY",
      },
    ];
    const slots = computeDaySlots(
      shopHours,
      holidays,
      [],
      "barber-1",
      "2026-08-15",
      30
    );
    expect(slots).toHaveLength(0);
  });

  it("detects working hour overlap", () => {
    expect(
      workingHoursWouldOverlap(
        [{ startMinute: 540, endMinute: 720, id: "a" }],
        { startMinute: 660, endMinute: 780, id: "b" }
      )
    ).toBe(true);
    expect(
      workingHoursWouldOverlap(
        [{ startMinute: 540, endMinute: 720, id: "a" }],
        { startMinute: 720, endMinute: 780, id: "b" }
      )
    ).toBe(false);
  });
});
