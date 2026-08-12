import { describe, it, expect } from "vitest";
import {
  getTehranTodayString,
  isTodayOrFutureInTehran,
  parseBookingDate,
  toDateString,
} from "@/lib/booking/timezone";

describe("Tehran timezone helpers", () => {
  it("returns YYYY-MM-DD for today", () => {
    expect(getTehranTodayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("parses and formats booking dates consistently", () => {
    const parsed = parseBookingDate("2026-08-15");
    expect(toDateString(parsed)).toBe("2026-08-15");
  });

  it("isTodayOrFuture rejects clearly past dates", () => {
    expect(isTodayOrFutureInTehran("2020-01-01")).toBe(false);
  });

  it("isTodayOrFuture accepts far future dates", () => {
    expect(isTodayOrFutureInTehran("2099-12-31")).toBe(true);
  });
});
