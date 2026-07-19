"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getAllAppointments, updateAppointmentStatus } from "@/app/actions/appointment";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { showSuccess, showError } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AppointmentStatus } from "@/app/generated/prisma/enums";
import { formatFaDate } from "@/lib/dates";
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

interface Appointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  user: { name: string; phone: string };
  barber: { user: { name: string } };
  appointmentServices: Array<{
    service: { name: string };
    priceAtBooking: unknown;
  }>;
  payment?: { status: string; amount: unknown } | null;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  CONFIRMED: { label: "تایید شده", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  COMPLETED: { label: "انجام شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  NO_SHOW: { label: "عدم حضور", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  PAID: { label: "پرداخت شده", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  FAILED: { label: "ناموفق", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  REFUNDED: { label: "بازپرداخت", color: "bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function load() {
      const result = await getAllAppointments();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری");
        setLoading(false);
        return;
      }
      setAppointments((result.data ?? []) as unknown as Appointment[]);
      setLoading(false);
    }
    load();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    const result = await updateAppointmentStatus({ id, status: status as AppointmentStatus });
    if (!result.success) {
      showError(result.error || "خطا در بروزرسانی");
    } else {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      showSuccess("وضعیت بروزرسانی شد");
    }
    setUpdating(null);
  };

  const filtered = appointments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.user.name?.toLowerCase().includes(q) ||
        a.user.phone?.includes(q) ||
        a.barber.user.name?.toLowerCase().includes(q)
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
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">مدیریت نوبت‌ها</h1>

      {error && <ErrorMessage message={error} />}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="جستجو نام، تلفن، آرایشگر..."
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
            <SelectItem value="CONFIRMED">تایید شده</SelectItem>
            <SelectItem value="COMPLETED">انجام شده</SelectItem>
            <SelectItem value="CANCELLED">لغو شده</SelectItem>
            <SelectItem value="NO_SHOW">عدم حضور</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
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
            {paginated.map((appt) => {
              const st = statusConfig[appt.status] ?? { label: appt.status, color: "bg-zinc-100" };
              const paySt = appt.payment
                ? paymentStatusConfig[appt.payment.status] ?? { label: appt.payment.status, color: "bg-zinc-100" }
                : null;

              return (
                <TableRow key={appt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{appt.user.name}</p>
                      <p className="text-xs text-zinc-500">{appt.user.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{appt.barber.user.name}</TableCell>
                  <TableCell>
                    {formatFaDate(appt.date)}
                  </TableCell>
                  <TableCell>
                    {appt.startTime} - {appt.endTime}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {appt.appointmentServices.map((as, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {as.service.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={st.color}>{st.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {paySt ? (
                      <Badge className={paySt.color}>{paySt.label}</Badge>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={appt.status}
                      onValueChange={(val) => val && handleStatusChange(appt.id, val)}
                      disabled={updating === appt.id}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">در انتظار</SelectItem>
                        <SelectItem value="CONFIRMED">تایید</SelectItem>
                        <SelectItem value="COMPLETED">انجام شده</SelectItem>
                        <SelectItem value="CANCELLED">لغو</SelectItem>
                        <SelectItem value="NO_SHOW">عدم حضور</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-zinc-400">
                  نوبتی یافت نشد
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
