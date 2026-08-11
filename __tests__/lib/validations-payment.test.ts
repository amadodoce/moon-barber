import { describe, it, expect } from "vitest";
import { paymentCallbackSchema } from "@/lib/validations/payment";

describe("paymentCallbackSchema", () => {
  it("accepts OK status with authority", () => {
    const parsed = paymentCallbackSchema.safeParse({
      Authority: "A00000000000000000000000000000000001",
      Status: "OK",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts NOK status", () => {
    const parsed = paymentCallbackSchema.safeParse({
      Authority: "A00000000000000000000000000000000001",
      Status: "NOK",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects missing authority", () => {
    const parsed = paymentCallbackSchema.safeParse({
      Status: "OK",
    });
    expect(parsed.success).toBe(false);
  });
});
