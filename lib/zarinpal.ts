import axios, { AxiosError } from "axios";

const REQUEST_TIMEOUT_MS = 15_000;

const SANDBOX = process.env.ZARINPAL_SANDBOX === "true";
const DEV_MOCK = process.env.ZARINPAL_DEV_MOCK === "true";

const API_BASE = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const GATEWAY_URL = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay/"
  : "https://www.zarinpal.com/pg/StartPay/";

export type ZarinpalErrorKind =
  | "config"
  | "network"
  | "timeout"
  | "gateway"
  | "invalid_response";

export interface ZarinpalRequestResult {
  success: boolean;
  authority: string;
  url: string;
  code?: number;
  message?: string;
  errors: string[];
  retryable: boolean;
  kind?: ZarinpalErrorKind;
}

export interface ZarinpalVerifyResult {
  success: boolean;
  refId: string;
  code?: number;
  message?: string;
  errors: string[];
  retryable: boolean;
  kind?: ZarinpalErrorKind;
}

interface V4DataBlock {
  code?: number;
  message?: string;
  authority?: string;
  ref_id?: number | string;
  fee_type?: string;
  fee?: number;
}

interface V4ErrorBlock {
  code?: number;
  message?: string;
  validations?: unknown[];
}

interface V4Envelope {
  data?: V4DataBlock | V4DataBlock[] | null;
  errors?: V4ErrorBlock | V4ErrorBlock[] | null;
}

function getMerchantId(): string {
  const id = process.env.ZARINPAL_MERCHANT_ID?.trim();
  if (!id || id.length !== 36) {
    throw new Error("تنظیمات درگاه پرداخت ناقص است (merchant_id)");
  }
  return id;
}

function getCallbackUrl(): string {
  const url = process.env.CALLBACK_URL?.trim();
  if (!url) {
    throw new Error("آدرس بازگشت پرداخت (CALLBACK_URL) تنظیم نشده است");
  }
  if (!SANDBOX && !DEV_MOCK && !url.startsWith("https://")) {
    throw new Error("CALLBACK_URL در محیط production باید HTTPS باشد");
  }
  return url;
}

function tomansToRials(amountTomans: number): number {
  if (!Number.isFinite(amountTomans) || amountTomans <= 0) {
    throw new Error("مبلغ پرداخت نامعتبر است");
  }
  const rials = Math.round(amountTomans * 10);
  if (rials < 1000) {
    throw new Error("حداقل مبلغ پرداخت ۱۰۰ تومان است");
  }
  return rials;
}

function unwrapData(envelope: V4Envelope): V4DataBlock | null {
  const { data } = envelope;
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

function unwrapErrors(envelope: V4Envelope): V4ErrorBlock[] {
  const { errors } = envelope;
  if (!errors) return [];
  return Array.isArray(errors) ? errors : [errors];
}

function formatGatewayErrors(errors: V4ErrorBlock[]): string[] {
  if (errors.length === 0) return ["خطای نامشخص درگاه پرداخت"];
  return errors.map((e) => {
    const code = e.code != null ? ` (${e.code})` : "";
    return `${e.message ?? "خطای درگاه"}${code}`;
  });
}

function classifyAxiosError(error: unknown): {
  kind: ZarinpalErrorKind;
  message: string;
  retryable: boolean;
} {
  if (axios.isAxiosError(error)) {
    const ax = error as AxiosError;
    if (ax.code === "ECONNABORTED" || ax.message.includes("timeout")) {
      return {
        kind: "timeout",
        message: "زمان اتصال به درگاه پرداخت به پایان رسید. لطفاً دوباره تلاش کنید.",
        retryable: true,
      };
    }
    if (!ax.response) {
      return {
        kind: "network",
        message: "خطا در ارتباط با درگاه پرداخت. اتصال اینترنت را بررسی کنید.",
        retryable: true,
      };
    }
    return {
      kind: "gateway",
      message: "درگاه پرداخت پاسخ نامعتبری برگرداند.",
      retryable: false,
    };
  }
  if (error instanceof Error) {
    return { kind: "config", message: error.message, retryable: false };
  }
  return { kind: "invalid_response", message: "خطای ناشناخته درگاه پرداخت", retryable: false };
}

export async function requestPayment(
  amountTomans: number,
  description: string,
  mobile?: string,
  email?: string
): Promise<ZarinpalRequestResult> {
  if (DEV_MOCK) {
    const mockAuthority = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const gatewayUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return {
      success: true,
      authority: mockAuthority,
      url: `${gatewayUrl}/book/payment-gateway?Authority=${encodeURIComponent(mockAuthority)}`,
      code: 100,
      message: "mock",
      errors: [],
      retryable: false,
    };
  }

  try {
    const merchantId = getMerchantId();
    const callbackUrl = getCallbackUrl();
    const amountRials = tomansToRials(amountTomans);

    const response = await axios.post<V4Envelope>(
      `${API_BASE}/request.json`,
      {
        merchant_id: merchantId,
        amount: amountRials,
        callback_url: callbackUrl,
        description,
        metadata: {
          mobile: mobile || undefined,
          email: email || undefined,
        },
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const envelope = response.data;
    const data = unwrapData(envelope);
    const gatewayErrors = unwrapErrors(envelope);

    if (data?.code === 100 && data.authority) {
      return {
        success: true,
        authority: data.authority,
        url: `${GATEWAY_URL}${data.authority}`,
        code: data.code,
        message: data.message,
        errors: [],
        retryable: false,
      };
    }

    return {
      success: false,
      authority: "",
      url: "",
      code: data?.code ?? gatewayErrors[0]?.code,
      message: data?.message ?? gatewayErrors[0]?.message,
      errors: formatGatewayErrors(gatewayErrors),
      retryable: false,
      kind: "gateway",
    };
  } catch (error) {
    const classified = classifyAxiosError(error);
    return {
      success: false,
      authority: "",
      url: "",
      errors: [classified.message],
      retryable: classified.retryable,
      kind: classified.kind,
    };
  }
}

export async function verifyPayment(
  amountTomans: number,
  authority: string
): Promise<ZarinpalVerifyResult> {
  if (DEV_MOCK) {
    return {
      success: true,
      refId: `MOCK_REF_${Date.now()}`,
      code: 100,
      message: "mock verified",
      errors: [],
      retryable: false,
    };
  }

  if (!authority?.trim()) {
    return {
      success: false,
      refId: "",
      errors: ["کد authority نامعتبر است"],
      retryable: false,
      kind: "invalid_response",
    };
  }

  try {
    const merchantId = getMerchantId();
    const amountRials = tomansToRials(amountTomans);

    const response = await axios.post<V4Envelope>(
      `${API_BASE}/verify.json`,
      {
        merchant_id: merchantId,
        amount: amountRials,
        authority,
      },
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    const envelope = response.data;
    const data = unwrapData(envelope);
    const gatewayErrors = unwrapErrors(envelope);
    const code = data?.code;

    if (code === 100 || code === 101) {
      const refId = data?.ref_id != null ? String(data.ref_id) : "";
      return {
        success: true,
        refId,
        code,
        message: data?.message,
        errors: [],
        retryable: false,
      };
    }

    return {
      success: false,
      refId: "",
      code,
      message: data?.message ?? gatewayErrors[0]?.message,
      errors: formatGatewayErrors(gatewayErrors),
      retryable: false,
      kind: "gateway",
    };
  } catch (error) {
    const classified = classifyAxiosError(error);
    return {
      success: false,
      refId: "",
      errors: [classified.message],
      retryable: classified.retryable,
      kind: classified.kind,
    };
  }
}

/** Exposed for tests */
export function getZarinpalConfig() {
  return { sandbox: SANDBOX, devMock: DEV_MOCK, apiBase: API_BASE, gatewayUrl: GATEWAY_URL };
}
