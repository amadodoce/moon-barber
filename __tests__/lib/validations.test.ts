import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts valid Iranian phone number", () => {
    const result = loginSchema.safeParse({
      phone: "09123456789",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone format", () => {
    const result = loginSchema.safeParse({
      phone: "1234567890",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      phone: "09123456789",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "علی",
      phone: "09123456789",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "علی",
      phone: "09123456789",
      password: "123456",
      confirmPassword: "654321",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "ا",
      phone: "09123456789",
      password: "123456",
      confirmPassword: "123456",
    });
    expect(result.success).toBe(false);
  });
});
