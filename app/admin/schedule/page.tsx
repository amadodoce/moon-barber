"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Clock, Calendar } from "lucide-react";
import { getWorkingHours, deleteWorkingHour } from "@/app/actions/working-hour";
import { getHolidays, deleteHoliday } from "@/app/actions/holiday";
import { getBarbers, type BarberWithUser } from "@/app/actions/barber";
import { WorkingHourForm } from "@/components/admin/WorkingHourForm";
import { HolidayForm } from "@/components/admin/HolidayForm";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAY_LABELS: Record<string, string> = {
  SATURDAY: "شنبه",
  SUNDAY: "یکشنبه",
  MONDAY: "دوشنبه",
  TUESDAY: "سه‌شنبه",
  WEDNESDAY: "چهارشنبه",
  THURSDAY: "پنجشنبه",
  FRIDAY: "جمعه",
};

export default function SchedulePage() {
  const [barbers, setBarbers] = useState<BarberWithUser[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>("shop");
  const [workingHours, setWorkingHours] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whDialogOpen, setWhDialogOpen] = useState(false);
  const [holDialogOpen, setHolDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const barbersResult = await getBarbers();
      if (barbersResult.success) {
        setBarbers(barbersResult.data ?? []);
      }
      await loadData("shop");
      setLoading(false);
    }
    load();
  }, []);

  const loadData = async (barberFilter: string) => {
    const barberId = barberFilter === "shop" ? undefined : barberFilter;
    const [whResult, holResult] = await Promise.all([
      getWorkingHours(barberId),
      getHolidays(barberId),
    ]);
    if (whResult.success) setWorkingHours(whResult.data ?? []);
    if (holResult.success) setHolidays(holResult.data ?? []);
  };

  const handleBarberChange = async (val: string) => {
    setSelectedBarber(val);
    await loadData(val);
  };

  const handleDeleteWH = async (id: string) => {
    setDeleting(id);
    const result = await deleteWorkingHour({ id });
    if (!result.success) setError(result.error || "خطا در حذف");
    else await loadData(selectedBarber);
    setDeleting(null);
  };

  const handleDeleteHoliday = async (id: string) => {
    setDeleting(id);
    const result = await deleteHoliday({ id });
    if (!result.success) setError(result.error || "خطا در حذف");
    else await loadData(selectedBarber);
    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">ساعات کاری و تعطیلات</h1>
      </div>

      {/* Barber filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">فیتر:</span>
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedBarber === "shop" ? "default" : "outline"}
            size="sm"
            onClick={() => handleBarberChange("shop")}
            className={selectedBarber === "shop" ? "bg-amber-500 hover:bg-amber-600" : ""}
          >
            فروشگاه
          </Button>
          {barbers.map((b) => (
            <Button
              key={b.id}
              variant={selectedBarber === b.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleBarberChange(b.id)}
              className={selectedBarber === b.id ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              {b.user.name}
            </Button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

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

        <TabsContent value="hours" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setWhDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="ml-2 h-4 w-4" />
              ساعات جدید
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workingHours.map((wh) => (
              <div
                key={wh.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {DAY_LABELS[wh.dayOfWeek] ?? wh.dayOfWeek}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {wh.startTime} - {wh.endTime}
                    </p>
                    {wh.specificDate && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        تاریخ خاص: {new Date(wh.specificDate).toLocaleDateString("fa-IR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={wh.isActive ? "default" : "secondary"}>
                      {wh.isRecurring ? "تکراری" : "یکبار"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWH(wh.id)}
                      disabled={deleting === wh.id}
                    >
                      {deleting === wh.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {workingHours.length === 0 && (
              <p className="col-span-full text-center py-8 text-zinc-400">
                ساعات کاری تعریف نشده است
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setHolDialogOpen(true)}
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Plus className="ml-2 h-4 w-4" />
              تعطیلی جدید
            </Button>
          </div>

          <div className="space-y-2">
            {holidays.map((hol) => (
              <div
                key={hol.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{hol.title}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(hol.date).toLocaleDateString("fa-IR")} •{" "}
                    {hol.type === "FULL_DAY" ? "تمام روز" : `${hol.startTime} - ${hol.endTime}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteHoliday(hol.id)}
                  disabled={deleting === hol.id}
                >
                  {deleting === hol.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-500" />
                  )}
                </Button>
              </div>
            ))}
            {holidays.length === 0 && (
              <p className="text-center py-8 text-zinc-400">
                تعطیلی تعریف نشده است
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <WorkingHourForm
        open={whDialogOpen}
        onOpenChange={setWhDialogOpen}
        barberId={selectedBarber === "shop" ? null : selectedBarber}
        onSaved={() => {
          setWhDialogOpen(false);
          loadData(selectedBarber);
        }}
      />

      <HolidayForm
        open={holDialogOpen}
        onOpenChange={setHolDialogOpen}
        barberId={selectedBarber === "shop" ? null : selectedBarber}
        onSaved={() => {
          setHolDialogOpen(false);
          loadData(selectedBarber);
        }}
      />
    </div>
  );
}
