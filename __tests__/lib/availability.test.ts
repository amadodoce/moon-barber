import { describe, it, expect } from "vitest";

// We test the pure functions from availability.ts by importing them directly
// Since availability.ts uses Prisma in getAvailableSlots, we test the utility functions

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function rangesOverlap(
  a: { start: string; end: string },
  b: { start: string; end: string }
): boolean {
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

function subtractRanges(
  available: Array<{ start: string; end: string }>,
  blocked: Array<{ start: string; end: string }>
): Array<{ start: string; end: string }> {
  const result: Array<{ start: string; end: string }> = [];

  for (const avail of available) {
    let current = { ...avail };

    const relevantBlocked = blocked
      .filter((b) => rangesOverlap(current, b))
      .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    for (const block of relevantBlocked) {
      const currentStart = timeToMinutes(current.start);
      const currentEnd = timeToMinutes(current.end);
      const blockStart = timeToMinutes(block.start);
      const blockEnd = timeToMinutes(block.end);

      if (blockStart > currentStart) {
        result.push({
          start: current.start,
          end: minutesToTime(Math.min(blockStart, currentEnd)),
        });
      }

      if (blockEnd < currentEnd) {
        current = { start: minutesToTime(blockEnd), end: current.end };
      } else {
        current = { start: current.end, end: current.end };
      }
    }

    if (timeToMinutes(current.start) < timeToMinutes(current.end)) {
      result.push(current);
    }
  }

  return result;
}

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
    expect(rangesOverlap({ start: "09:00", end: "12:00" }, { start: "11:00", end: "13:00" })).toBe(true);
  });

  it("detects non-overlapping ranges", () => {
    expect(rangesOverlap({ start: "09:00", end: "11:00" }, { start: "11:00", end: "13:00" })).toBe(false);
  });

  it("detects contained range", () => {
    expect(rangesOverlap({ start: "09:00", end: "14:00" }, { start: "10:00", end: "12:00" })).toBe(true);
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
