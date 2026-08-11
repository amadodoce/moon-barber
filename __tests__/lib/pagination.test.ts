import { describe, it, expect } from "vitest";
import { normalizeListQuery, buildPaginatedResult } from "@/lib/pagination";

describe("pagination", () => {
  it("normalizes page and pageSize with defaults", () => {
    expect(normalizeListQuery({})).toEqual({
      page: 1,
      pageSize: 20,
      status: "all",
      search: "",
    });
  });

  it("clamps invalid page values", () => {
    expect(normalizeListQuery({ page: -1, pageSize: 200 }).page).toBe(1);
    expect(normalizeListQuery({ pageSize: 200 }).pageSize).toBe(100);
  });

  it("builds paginated result metadata", () => {
    const result = buildPaginatedResult(["a", "b"], 45, 2, 20);
    expect(result.totalPages).toBe(3);
    expect(result.items).toHaveLength(2);
  });
});
