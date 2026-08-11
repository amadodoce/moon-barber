import { NextResponse } from "next/server";
import { handlePaymentCallback } from "@/app/actions/payment";
import { paymentCallbackSchema } from "@/lib/validations/payment";

const RESULT_PATH = "/customer/payment/result";

function redirectToResult(
  request: Request,
  params: Record<string, string>
): NextResponse {
  const url = new URL(RESULT_PATH, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * Zarinpal payment callback endpoint.
 * After the user completes (or fails) payment on Zarinpal,
 * they are redirected here with Authority and Status query params.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = paymentCallbackSchema.safeParse({
    Authority: searchParams.get("Authority") ?? undefined,
    Status: searchParams.get("Status") ?? undefined,
  });

  if (!parsed.success) {
    return redirectToResult(request, { status: "error" });
  }

  const { Authority: authority, Status: status } = parsed.data;

  const result = await handlePaymentCallback(authority, status);

  if (!result.success || !result.data) {
    const appointmentId = searchParams.get("appointmentId") ?? undefined;
    return redirectToResult(request, {
      status: "error",
      ...(appointmentId ? { appointmentId } : {}),
    });
  }

  const { outcome, appointmentId } = result.data;

  const statusMap: Record<string, string> = {
    success: "success",
    late_paid: "late_paid",
    cancelled: "cancelled",
    failed: "failed",
    pending_review: "pending_review",
  };

  return redirectToResult(request, {
    status: statusMap[outcome] ?? "error",
    appointmentId,
  });
}
