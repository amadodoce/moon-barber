"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { updateAppointmentStatus, type AdminAppointment } from "@/app/actions/appointment";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { showSuccess, showError } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/brand";
import {
  appointmentStatusConfig,
  getAppointmentStatus,
  getPaymentStatus,
} from "@/lib/status-config";
import type { AppointmentStatus } from "@/app/generated/prisma/enums";
import { formatFaDate } from "@/lib/dates";
import type { PaginatedResult } from "@/lib/pagination";

interface AppointmentsViewProps {
  data: PaginatedResult<AdminAppointment>;
  filters: {
    page: number;
    status: string;
    search: string;
  };
  error?: string | null;
}

const statusOptions = Object.entries(appointmentStatusConfig).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export function AppointmentsView({ data, filters, error }: AppointmentsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    const result = await updateAppointmentStatus({
      id,
      status: status as AppointmentStatus,
    });
    if (!result.success) {
      showError(result.error || "خطا در بروزرسانی");
    } else {
      showSuccess("وضعیت بروزرسانی شد");
      router.refresh();
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="مدیریت نوبت‌ها"
        description="جستجو، فیلتر و به‌روزرسانی وضعیت نوبت‌ها"
        eyebrow="عملیات"
      />

      {error ? <ErrorMessage message={error} /> : null}

      <div className="flex flex-col gap-[var(--space-xs)] sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]"
            aria-hidden="true"
          />
          <Input
            placeholder="جستجو نام، تلفن، آرایشگر…"
            defaultValue={filters.search}
            className="pr-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({
                  q: (e.target as HTMLInputElement).value,
                  page: "1",
                });
              }
            }}
          />
        </div>
        <Select
          value={filters.status}
          onValueChange={(v) => v && updateParams({ status: v, page: "1" })}
          items={[{ value: "all", label: "همه" }, ...statusOptions]}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SurfaceCard padding="none" className={isPending ? "opacity-60" : undefined}>
        <div className="overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>مشتری</TableHead>
                <TableHead>آرایشگر</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>ساعت</TableHead>
                <TableHead>سرویس‌ها</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>پرداخت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((appt) => {
                const st = getAppointmentStatus(appt.status);
                const paySt = appt.payment
                  ? getPaymentStatus(appt.payment.status)
                  : null;

                return (
                  <TableRow key={appt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">
                          {appt.user.name}
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {appt.user.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{appt.barber.user.name}</TableCell>
                    <TableCell>{formatFaDate(appt.date)}</TableCell>
                    <TableCell>
                      {appt.startTime} – {appt.endTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {appt.appointmentServices.map((as, i) => (
                          <StatusBadge
                            key={i}
                            label={as.service.name}
                            bgVar="var(--color-paper-3)"
                            fgVar="var(--color-ink-2)"
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={st.label}
                        bgVar={st.bgVar}
                        fgVar={st.fgVar}
                      />
                    </TableCell>
                    <TableCell>
                      {paySt ? (
                        <StatusBadge
                          label={paySt.label}
                          bgVar={paySt.bgVar}
                          fgVar={paySt.fgVar}
                        />
                      ) : (
                        <span className="text-xs text-[var(--color-ink-faint)]">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={appt.status}
                        onValueChange={(val) =>
                          val && handleStatusChange(appt.id, val)
                        }
                        disabled={updating === appt.id}
                        items={statusOptions.map((o) => ({
                          value: o.value,
                          label: o.label,
                        }))}
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {data.items.length === 0 ? (
          <div className="p-[var(--space-md)]">
            <EmptyState title="نوبتی یافت نشد" />
          </div>
        ) : null}
      </SurfaceCard>

      <Pagination
        currentPage={data.page}
        totalPages={data.totalPages}
        onPageChange={(page) => updateParams({ page: String(page) })}
      />
    </div>
  );
}
