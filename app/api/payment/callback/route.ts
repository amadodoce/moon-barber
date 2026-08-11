import { NextResponse } from "next/server";
import { handlePaymentCallback } from "@/app/actions/payment";

const RESULT_PATH = "/customer/payment/result";

/**
 * Zarinpal payment callback endpoint.
 *
 * After the user completes (or fails) payment on Zarinpal,
 * they are redirected here with Authority and Status query params.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  if (!authority || !status) {
    return NextResponse.redirect(
      new URL(`${RESULT_PATH}?status=error`, request.url)
    );
  }

  const result = await handlePaymentCallback(authority, status);

  if (!result.success || !result.data) {
    return NextResponse.redirect(
      new URL(`${RESULT_PATH}?status=error`, request.url)
    );
  }

  if (result.data.success) {
    return NextResponse.redirect(
      new URL(
        `${RESULT_PATH}?status=success&appointmentId=${result.data.appointmentId}`,
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(
      `${RESULT_PATH}?status=failed&appointmentId=${result.data.appointmentId}`,
      request.url
    )
  );
}
