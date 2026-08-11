import { describe, expect, it } from "vitest";
import { getSafeCallbackUrl } from "@/lib/auth-redirect";

describe("getSafeCallbackUrl", () => {
  it("returns admin dashboard for ADMIN role", () => {
    expect(getSafeCallbackUrl("/book/summary", "ADMIN")).toBe("/admin");
  });

  it("returns barber dashboard for BARBER role", () => {
    expect(getSafeCallbackUrl("/book/summary", "BARBER")).toBe("/barber");
  });

  it("honors safe internal callback for CUSTOMER", () => {
    expect(getSafeCallbackUrl("/book/summary", "CUSTOMER")).toBe("/book/summary");
  });

  it("rejects external callback URLs for CUSTOMER", () => {
    expect(getSafeCallbackUrl("//evil.com", "CUSTOMER")).toBe("/customer");
    expect(getSafeCallbackUrl("https://evil.com", "CUSTOMER")).toBe("/customer");
  });

  it("defaults CUSTOMER to /customer when callback is root", () => {
    expect(getSafeCallbackUrl("/", "CUSTOMER")).toBe("/customer");
  });
});
