"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getPayments } from "@/app/actions/payment";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface Payment {
  id: string;
  amount: unknown;
  status: string;
  method: string;
  zarinpalRefId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  appointment: {
    id: string;
    date: Date;
    startTime: string;
    user: { name: string; phone: string };
    barber: { user: { name: string } };
  };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  PAID: { label: "پرداخت شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  FAILED: { label: "ناموفق", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  REFUNDED: { label: "بازپرداخت", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function load() {
      const result = await getPayments();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری");
        setLoading(false);
        return;
      }
      setPayments((result.data ?? []) as unknown as Payment[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.appointment.user.name?.toLowerCase().includes(q) ||
        p.appointment.user.phone?.includes(q) ||
        p.zarinpalRefId?.includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">مدیریت پرداخت‌ها</h1>

      {error && <ErrorMessage message={error} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="جستجو نام، تلفن، کد رهگیری..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="PENDING">در انتظار</SelectItem>
            <SelectItem value="PAID">پرداخت شده</SelectItem>
            <SelectItem value="FAILED">ناموفق</SelectItem>
            <SelectItem value="REFUNDED">بازپرداخت</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
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
            {paginated.map((pay) => {
              const st = statusConfig[pay.status] ?? {
                label: pay.status,
                color: "bg-zinc-100",
              };

              return (
                <TableRow key={pay.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{pay.appointment.user.name}</p>
                      <p className="text-xs text-zinc-500">
                        {pay.appointment.user.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{pay.appointment.barber.user.name}</TableCell>
                  <TableCell className="font-medium">
                    {Number(pay.amount).toLocaleString("fa-IR")} تومان
                  </TableCell>
                  <TableCell>
                    <Badge className={st.color}>{st.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(pay.appointment.date).toLocaleDateString("fa-IR")}{" "}
                    {pay.appointment.startTime}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {pay.zarinpalRefId || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-zinc-500">
                    {pay.paidAt
                      ? new Date(pay.paidAt).toLocaleDateString("fa-IR")
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-zinc-400">
                  پرداختی یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
