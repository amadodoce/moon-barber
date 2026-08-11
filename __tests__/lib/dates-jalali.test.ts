import { describe, it, expect } from "vitest";
import { formatJalaliDate, formatJalaliMonthYear, toLocalDateString } from "@/lib/dates";

describe("jalali date formatting", () => {
  it("formats Jalali month year in Persian", () => {
    const date = new Date(2026, 7, 11);
    const label = formatJalaliMonthYear(date);
    expect(label).toMatch(/[\u0600-\u06FF]/);
  });

  it("formats Jalali date while storage stays YYYY-MM-DD", () => {
    const date = new Date(2026, 7, 11);
    expect(toLocalDateString(date)).toBe("2026-08-11");
    const jalali = formatJalaliDate(date);
    expect(jalali).toMatch(/[\u0600-\u06FF]/);
  });
});
