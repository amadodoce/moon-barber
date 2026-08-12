"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Clock, Calendar, Pencil } from "lucide-react";
import { deleteWorkingHour } from "@/app/actions/working-hour";
import { deleteHoliday } from "@/app/actions/holiday";
import type { BarberWithUser } from "@/app/actions/barber";
import { WorkingHourForm } from "@/components/admin/WorkingHourForm";
import { HolidayForm } from "@/components/admin/HolidayForm";
import { showSuccess, showError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatFaDate } from "@/lib/dates";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/brand";

const DAY_LABELS: Record<string, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
  FRIDAY: "جمعه",
};

export type WorkingHourRow = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDateStr: string | null;
  isActive: boolean;
};

export type HolidayRow = {
  id: string;
  title: string;
  date: Date;
  type: string;
  startTime: string | null;
  endTime: string | null;
};

interface ScheduleViewProps {
  barbers: BarberWithUser[];
  workingHours: WorkingHourRow[];
  holidays: HolidayRow[];
  selectedBarber: string;
}

export function ScheduleView({
  barbers,
  workingHours,
  holidays,
  selectedBarber,
}: ScheduleViewProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [holDialogOpen, setHolDialogOpen] = useState(false);
  const [editWH, setEditWH] = useState<WorkingHourRow | null>(null);
  const [editHoliday, setEditHoliday] = useState<HolidayRow | null>(null);

  const barberIdForForm = selectedBarber === "shop" ? null : selectedBarber;

  const navigateBarber = (barber: string) => {
    router.push(barber === "shop" ? "/admin/schedule" : `/admin/schedule?barber=${barber}`);
  };

  const refresh = () => router.refresh();

  const handleDeleteWH = async (id: string) => {
    setDeleting(id);
    const result = await deleteWorkingHour({ id });
    if (!result.success) showError(result.error || "خطا در حذف");
    else {
      showSuccess("ساعت کاری حذف شد");
      refresh();
    }
    setDeleting(null);
  };

  const handleDeleteHoliday = async (id: string) => {
    setDeleting(id);
    const result = await deleteHoliday({ id });
    if (!result.success) showError(result.error || "خطا در حذف");
    else {
      showSuccess("تعطیلی حذف شد");
      refresh();
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="ساعات کاری و تعطیلات"
        description="تنظیم برنامه کاری فروشگاه و آرایشگران"
        eyebrow="پیکربندی"
      />

      <div className="flex flex-wrap items-center gap-[var(--space-2xs)]">
        <span className="text-sm text-[var(--color-ink-muted)]">فیلتر:</span>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedBarber === "shop" ? "default" : "outline"}
            size="sm"
            onClick={() => navigateBarber("shop")}
          >
            فروشگاه
          </Button>
          {barbers.map((b) => (
            <Button
              key={b.id}
              variant={selectedBarber === b.id ? "default" : "outline"}
              size="sm"
              onClick={() => navigateBarber(b.id)}
            >
              {b.user.name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            ساعات کاری
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2">
            <Calendar className="h-4 w-4" />
            تعطیلات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours" className="space-y-[var(--space-sm)]">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditWH(null);
                setWhDialogOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              ساعات جدید
            </Button>
          </div>

          {workingHours.length === 0 ? (
            <EmptyState
              title="ساعات کاری تعریف نشده است"
              icon={<Clock className="h-8 w-8" />}
              action={{
                label: "افزودن ساعات",
                onClick: () => setWhDialogOpen(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-[var(--space-xs)] sm:grid-cols-2 lg:grid-cols-3">
              {workingHours.map((wh) => (
                <SurfaceCard key={wh.id} padding="sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">
                        {DAY_LABELS[wh.dayOfWeek] ?? wh.dayOfWeek}
                      </p>
                      <p className="text-sm text-[var(--color-ink-muted)]">
                        {wh.startTime} – {wh.endTime}
                      </p>
                      {wh.specificDateStr ? (
                        <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                          تاریخ خاص: {formatFaDate(wh.specificDateStr)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusBadge
                        label={wh.isRecurring ? "تکراری" : "یکبار"}
                        bgVar="var(--color-paper-3)"
                        fgVar="var(--color-ink-2)"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="ویرایش ساعت کاری"
                        onClick={() => {
                          setEditWH(wh);
                          setWhDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWH(wh.id)}
                        disabled={deleting === wh.id}
                        aria-label="حذف ساعت کاری"
                      >
                        {deleting === wh.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-[var(--status-failed-fg)]" />
                        )}
                      </Button>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="holidays" className="space-y-[var(--space-sm)]">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditHoliday(null);
                setHolDialogOpen(true);
              }}
            >
              <Plus className="ml-2 h-4 w-4" />
              تعطیلی جدید
            </Button>
          </div>

          {holidays.length === 0 ? (
            <EmptyState
              title="تعطیلی تعریف نشده است"
              icon={<Calendar className="h-8 w-8" />}
              action={{
                label: "افزودن تعطیلی",
                onClick: () => setHolDialogOpen(true),
              }}
            />
          ) : (
            <div className="space-y-[var(--space-xs)]">
              {holidays.map((hol) => (
                <SurfaceCard key={hol.id} padding="sm">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{hol.title}</p>
                      <p className="text-sm text-[var(--color-ink-muted)]">
                        {formatFaDate(hol.date)} ·{" "}
                        {hol.type === "FULL_DAY"
                          ? "تمام روز"
                          : `${hol.startTime} – ${hol.endTime}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="ویرایش تعطیلی"
                        onClick={() => {
                          setEditHoliday(hol);
                          setHolDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHoliday(hol.id)}
                        disabled={deleting === hol.id}
                        aria-label="حذف تعطیلی"
                      >
                        {deleting === hol.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-[var(--status-failed-fg)]" />
                        )}
                      </Button>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <WorkingHourForm
        open={whDialogOpen}
        onOpenChange={(open) => {
          setWhDialogOpen(open);
          if (!open) setEditWH(null);
        }}
        barberId={barberIdForForm}
        editItem={editWH}
        onSaved={() => {
          setWhDialogOpen(false);
          setEditWH(null);
          refresh();
        }}
      />

      <HolidayForm
        open={holDialogOpen}
        onOpenChange={(open) => {
          setHolDialogOpen(open);
          if (!open) setEditHoliday(null);
        }}
        barberId={barberIdForForm}
        editItem={editHoliday}
        onSaved={() => {
          setHolDialogOpen(false);
          setEditHoliday(null);
          refresh();
        }}
      />
    </div>
  );
}
