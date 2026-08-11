import { describe, it, expect } from "vitest";
import {
  timeToMinutes,
  minutesToTime,
  rangesOverlap,
  subtractRanges,
  filterPastSlots,
} from "@/lib/availability";
import { getTodayLocalDateString } from "@/lib/dates";

describe("timeToMinutes", () => {
  it("converts midnight", () => {
    expect(timeToMinutes("00:00")).toBe(0);
  });

  it("converts morning time", () => {
    expect(timeToMinutes("09:30")).toBe(570);
  });

  it("converts end of day", () => {
    expect(timeToMinutes("23:59")).toBe(1439);
  });
});

describe("minutesToTime", () => {
  it("converts 0 to midnight", () => {
    expect(minutesToTime(0)).toBe("00:00");
  });

  it("converts 570 to 09:30", () => {
    expect(minutesToTime(570)).toBe("09:30");
  });

  it("pads single digits", () => {
    expect(minutesToTime(65)).toBe("01:05");
  });
});

describe("rangesOverlap", () => {
  it("detects overlapping ranges", () => {
    expect(
      rangesOverlap({ start: "09:00", end: "12:00" }, { start: "11:00", end: "13:00" })
    ).toBe(true);
  });

  it("detects non-overlapping ranges", () => {
    expect(
      rangesOverlap({ start: "09:00", end: "11:00" }, { start: "11:00", end: "13:00" })
    ).toBe(false);
  });

  it("detects contained range", () => {
    expect(
      rangesOverlap({ start: "09:00", end: "14:00" }, { start: "10:00", end: "12:00" })
    ).toBe(true);
  });
});

describe("subtractRanges", () => {
  it("returns original when no blocked ranges", () => {
    const available = [{ start: "09:00", end: "17:00" }];
    const result = subtractRanges(available, []);
    expect(result).toEqual([{ start: "09:00", end: "17:00" }]);
  });

  it("removes middle block", () => {
    const available = [{ start: "09:00", end: "17:00" }];
    const blocked = [{ start: "12:00", end: "13:00" }];
    const result = subtractRanges(available, blocked);
    expect(result).toEqual([
      { start: "09:00", end: "12:00" },
      { start: "13:00", end: "17:00" },
    ]);
  });

  it("removes start block", () => {
    const available = [{ start: "09:00", end: "17:00" }];
    const blocked = [{ start: "09:00", end: "11:00" }];
    const result = subtractRanges(available, blocked);
    expect(result).toEqual([{ start: "11:00", end: "17:00" }]);
  });

  it("removes end block", () => {
    const available = [{ start: "09:00", end: "17:00" }];
    const blocked = [{ start: "15:00", end: "17:00" }];
    const result = subtractRanges(available, blocked);
    expect(result).toEqual([{ start: "09:00", end: "15:00" }]);
  });

  it("returns empty when fully blocked", () => {
    const available = [{ start: "09:00", end: "17:00" }];
    const blocked = [{ start: "09:00", end: "17:00" }];
    const result = subtractRanges(available, blocked);
    expect(result).toEqual([]);
  });

  it("handles multiple blocks", () => {
    const available = [{ start: "09:00", end: "18:00" }];
    const blocked = [
      { start: "10:00", end: "11:00" },
      { start: "14:00", end: "15:00" },
    ];
    const result = subtractRanges(available, blocked);
    expect(result).toEqual([
      { start: "09:00", end: "10:00" },
      { start: "11:00", end: "14:00" },
      { start: "15:00", end: "18:00" },
    ]);
  });
});

describe("filterPastSlots", () => {
  it("returns all slots for future dates", () => {
    const slots = [
      { startTime: "09:00", endTime: "10:00" },
      { startTime: "10:00", endTime: "11:00" },
    ];
    expect(filterPastSlots(slots, "2099-01-01")).toEqual(slots);
  });

  it("filters elapsed slots for today", () => {
    const today = getTodayLocalDateString();
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const pastSlot = minutesToTime(Math.max(0, nowMinutes - 60));
    const futureSlot = minutesToTime(Math.min(23 * 60 + 45, nowMinutes + 120));

    const result = filterPastSlots(
      [
        { startTime: pastSlot, endTime: minutesToTime(Math.max(0, nowMinutes - 30)) },
        { startTime: futureSlot, endTime: minutesToTime(Math.min(23 * 60 + 59, nowMinutes + 180)) },
      ],
      today
    );

    expect(result.some((slot) => slot.startTime === futureSlot)).toBe(true);
    expect(result.some((slot) => slot.startTime === pastSlot)).toBe(false);
  });
});
