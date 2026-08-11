import { Suspense } from "react";
import { getAllAppointments } from "@/app/actions/appointment";
import { AppointmentsView } from "@/components/admin/AppointmentsView";
import { AdminRouteLoading } from "@/components/admin/AdminRouteLoading";
import { buildPaginatedResult } from "@/lib/pagination";
import type { AdminAppointment } from "@/app/actions/appointment";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
}

async function AppointmentsContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status || "all";
  const search = params.q || "";

  const result = await getAllAppointments({ page, pageSize: 20, status, search });

  const empty = buildPaginatedResult<AdminAppointment>([], 0, page, 20);

  return (
    <AppointmentsView
      data={result.success && result.data ? result.data : empty}
      filters={{ page, status, search }}
      error={result.success ? null : result.error}
    />
  );
}

export default function AppointmentsPage(props: PageProps) {
  return (
    <Suspense fallback={<AdminRouteLoading title="مدیریت نوبت‌ها" variant="table" />}>
      <AppointmentsContent {...props} />
    </Suspense>
  );
}
