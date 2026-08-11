import { Suspense } from "react";
import { getPayments } from "@/app/actions/payment";
import { PaymentsView } from "@/components/admin/PaymentsView";
import { AdminRouteLoading } from "@/components/admin/AdminRouteLoading";
import { buildPaginatedResult } from "@/lib/pagination";
import type { PaymentWithRelations } from "@/app/actions/payment";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
}

async function PaymentsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status || "all";
  const search = params.q || "";

  const result = await getPayments({ page, pageSize: 20, status, search });

  const empty = buildPaginatedResult<PaymentWithRelations>([], 0, page, 20);

  return (
    <PaymentsView
      data={result.success && result.data ? result.data : empty}
      filters={{ page, status, search }}
      error={result.success ? null : result.error}
    />
  );
}

export default function PaymentsPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminRouteLoading title="مدیریت پرداخت‌ها" variant="table" />}>
      <PaymentsContent {...props} />
    </Suspense>
  );
}
