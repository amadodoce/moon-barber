import axios from "axios";

// ─── Configuration ────────────────────────────────────────────────────────────
// Switch between sandbox and production by setting ZARINPAL_SANDBOX=true in .env
// Sandbox: https://sandbox.zarinpal.com/merchant/dashboard
// Production: https://panel.zarinpal.com/merchant/dashboard

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const SANDBOX = process.env.ZARINPAL_SANDBOX === "true";
const CALLBACK_URL = process.env.CALLBACK_URL!;

// Zarinpal API base URLs
const BASE_URL = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/rest/WebGate"
  : "https://api.zarinpal.com/pg/rest/WebGate";

// Gateway URL where user is redirected to pay
const GATEWAY_URL = SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay/"
  : "https://www.zarinpal.com/pg/StartPay/";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZarinpalRequestResult {
  success: boolean;
  authority: string;
  url: string;
  errors: string[];
}

export interface ZarinpalVerifyResult {
  success: boolean;
  refId: string;
  errors: string[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Request a payment from Zarinpal.
 * Returns an authority code and the URL to redirect the user to.
 *
 * @param amount - Payment amount in Tomans (Zarinpal converts to Rials internally)
 * @param description - Payment description shown to user
 * @param mobile - Customer mobile (optional, for Zarinpal records)
 * @param email - Customer email (optional, for Zarinpal records)
 */
export async function requestPayment(
  amount: number,
  description: string,
  mobile?: string,
  email?: string
): Promise<ZarinpalRequestResult> {
  // Zarinpal amount is in Rials (1 Toman = 10 Rials)
  const amountInRials = amount * 10;

  const response = await axios.post(`${BASE_URL}/Request.json`, {
    merchant_id: MERCHANT_ID,
    amount: amountInRials,
    callback_url: CALLBACK_URL,
    description,
    metadata: {
      email: email || undefined,
      mobile: mobile || undefined,
    },
  });

  const data = response.data as {
    Status: number;
    Authority: string;
    Errors: string[];
  };

  // Status 100 = success
  if (data.Status === 100) {
    return {
      success: true,
      authority: data.Authority,
      url: `${GATEWAY_URL}${data.Authority}`,
      errors: [],
    };
  }

  return {
    success: false,
    authority: "",
    url: "",
    errors: data.Errors || [`خطای Zarinpal: کد ${data.Status}`],
  };
}

/**
 * Verify a payment after the user completes (or fails) the gateway.
 * Must be called server-side with the same amount used in requestPayment.
 *
 * @param amount - Original amount in Tomans (must match requestPayment amount)
 * @param authority - Authority code received from callback
 */
export async function verifyPayment(
  amount: number,
  authority: string
): Promise<ZarinpalVerifyResult> {
  const amountInRials = amount * 10;

  const response = await axios.post(`${BASE_URL}/Verification.json`, {
    merchant_id: MERCHANT_ID,
    amount: amountInRials,
    authority,
  });

  const data = response.data as {
    Status: number;
    RefID: string;
    Errors: string[];
  };

  // Status 100 or 101 = payment verified successfully
  if (data.Status === 100 || data.Status === 101) {
    return {
      success: true,
      refId: data.RefID,
      errors: [],
    };
  }

  return {
    success: false,
    refId: "",
    errors: data.Errors || [`خطای تایید پرداخت: کد ${data.Status}`],
  };
}
