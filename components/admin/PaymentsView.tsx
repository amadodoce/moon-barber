"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search } from "lucide-react";
import type { PaymentWithRelations } from "@/app/actions/payment";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
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
import { getPaymentStatus, paymentStatusConfig } from "@/lib/status-config";
import { formatFaDate } from "@/lib/dates";
import type { PaginatedResult } from "@/lib/pagination";

interface PaymentsViewProps {
  data: PaginatedResult<PaymentWithRelations>;
  filters: {
    page: number;
    status: string;
    search: string;
  };
  error?: string | null;
}

const statusOptions = Object.entries(paymentStatusConfig).map(
  ([value, cfg]) => ({ value, label: cfg.label })
);

export function PaymentsView({ data, filters, error }: PaymentsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="مدیریت پرداخت‌ها"
        description="پیگیری وضعیت پرداخت‌ها و کدهای رهگیری"
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
            placeholder="جستجو نام، تلفن، کد رهگیری…"
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
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>مشتری</TableHead>
                <TableHead>آرایشگر</TableHead>
                <TableHead>مبلغ</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ نوبت</TableHead>
                <TableHead>کد رهگیری</TableHead>
                <TableHead>تاریخ پرداخت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((pay) => {
                const st = getPaymentStatus(pay.status);
                return (
                  <TableRow key={pay.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--color-ink)]">
                          {pay.appointment.user.name}
                        </p>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                          {pay.appointment.user.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{pay.appointment.barber.user.name}</TableCell>
                    <TableCell className="font-medium">
                      {Number(pay.amount).toLocaleString("fa-IR")} تومان
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={st.label}
                        bgVar={st.bgVar}
                        fgVar={st.fgVar}
                      />
                    </TableCell>
                    <TableCell>
                      {formatFaDate(pay.appointment.date)}{" "}
                      {pay.appointment.startTime}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--color-ink-muted)]">
                      {pay.zarinpalRefId || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--color-ink-muted)]">
                      {pay.paidAt ? formatFaDate(pay.paidAt) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {data.items.length === 0 ? (
          <div className="p-[var(--space-md)]">
            <EmptyState title="پرداختی یافت نشد" />
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
