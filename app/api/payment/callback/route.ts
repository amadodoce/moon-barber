import { NextResponse } from "next/server";
import { handlePaymentCallback } from "@/app/actions/payment";

/**
 * Zarinpal payment callback endpoint.
 *
 * After the user completes (or fails) payment on Zarinpal,
 * they are redirected here with Authority and Status query params.
 *
 * This route:
 * 1. Extracts Authority and Status from URL
 * 2. Calls handlePaymentCallback to verify and update DB
 * 3. Redirects to the result page with status
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  if (!authority || !status) {
    return NextResponse.redirect(
      new URL("/dashboard/payment/result?status=error", request.url)
    );
  }

  const result = await handlePaymentCallback(authority, status);

  if (!result.success || !result.data) {
    return NextResponse.redirect(
      new URL("/dashboard/payment/result?status=error", request.url)
    );
  }

  if (result.data.success) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/payment/result?status=success&appointmentId=${result.data.appointmentId}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      `/dashboard/payment/result?status=failed&appointmentId=${result.data.appointmentId}`,
      request.url
    )
  );
}
