import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    isAxiosError: (err: unknown) =>
      typeof err === "object" && err !== null && "isAxiosError" in err,
  },
}));

describe("zarinpal v4 client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      ZARINPAL_DEV_MOCK: "false",
      ZARINPAL_SANDBOX: "true",
      ZARINPAL_MERCHANT_ID: "00000000-0000-0000-0000-000000000000",
      CALLBACK_URL: "http://localhost:3000/api/payment/callback",
    };
    vi.mocked(axios.post).mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses sandbox v4 request endpoint", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        data: { code: 100, authority: "A00000000000000000000000000000000001", message: "ok" },
        errors: [],
      },
    });

    const { requestPayment, getZarinpalConfig } = await import("@/lib/zarinpal");
    expect(getZarinpalConfig().apiBase).toContain("sandbox.zarinpal.com/pg/v4/payment");

    const result = await requestPayment(50000, "test payment", "09120000000");
    expect(result.success).toBe(true);
    expect(result.authority).toContain("A000");
    expect(vi.mocked(axios.post).mock.calls[0][0]).toContain("/request.json");
    expect(vi.mocked(axios.post).mock.calls[0][1]).toMatchObject({
      amount: 500000,
      merchant_id: "00000000-0000-0000-0000-000000000000",
    });
  });

  it("treats verify code 101 as success", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        data: { code: 101, ref_id: 12345, message: "already verified" },
        errors: [],
      },
    });

    const { verifyPayment } = await import("@/lib/zarinpal");
    const result = await verifyPayment(50000, "A00000000000000000000000000000000001");
    expect(result.success).toBe(true);
    expect(result.refId).toBe("12345");
  });

  it("returns retryable network errors", async () => {
    const networkError = Object.assign(new Error("Network Error"), {
      isAxiosError: true,
      code: "ERR_NETWORK",
      response: undefined,
    });
    vi.mocked(axios.post).mockRejectedValueOnce(networkError);

    const { requestPayment } = await import("@/lib/zarinpal");
    const result = await requestPayment(10000, "test");
    expect(result.success).toBe(false);
    expect(result.retryable).toBe(true);
    expect(result.kind).toBe("network");
  });

  it("uses mock mode when ZARINPAL_DEV_MOCK=true", async () => {
    process.env.ZARINPAL_DEV_MOCK = "true";
    const { requestPayment } = await import("@/lib/zarinpal");
    const result = await requestPayment(10000, "mock");
    expect(result.success).toBe(true);
    expect(result.url).toContain("/book/payment-gateway");
    expect(vi.mocked(axios.post)).not.toHaveBeenCalled();
  });
});
