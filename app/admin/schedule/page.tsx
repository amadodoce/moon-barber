import { Suspense } from "react";
import { getAllBarbers } from "@/app/actions/barber";
import { getWorkingHours } from "@/app/actions/working-hour";
import { getHolidays } from "@/app/actions/holiday";
import { ScheduleView } from "@/components/admin/ScheduleView";
import { AdminRouteLoading } from "@/components/admin/AdminRouteLoading";

interface PageProps {
  searchParams: Promise<{ barber?: string }>;
}

async function ScheduleContent({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedBarber = params.barber ?? "shop";
  const barberId = selectedBarber === "shop" ? undefined : selectedBarber;

  const [barbersResult, whResult, holResult] = await Promise.all([
    getAllBarbers(),
    getWorkingHours(barberId),
    getHolidays(barberId),
  ]);

  return (
    <ScheduleView
      barbers={barbersResult.success ? (barbersResult.data ?? []) : []}
      workingHours={whResult.success ? (whResult.data ?? []) : []}
      holidays={holResult.success ? (holResult.data ?? []) : []}
      selectedBarber={selectedBarber}
    />
  );
}

export default function SchedulePage(props: PageProps) {
  return (
    <Suspense
      fallback={<AdminRouteLoading title="ساعات کاری و تعطیلات" variant="cards" />}
    >
      <ScheduleContent {...props} />
    </Suspense>
  );
}
