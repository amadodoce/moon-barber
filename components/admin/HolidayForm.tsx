"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHolidaySchema } from "@/lib/validations/holiday";
import { createHoliday } from "@/app/actions/holiday";
import type { z } from "zod";
import { showSuccess, showError } from "@/lib/toast";
import type { HolidayType } from "@/app/generated/prisma/enums";

type HolidayFormInput = z.input<typeof createHolidaySchema>;

const inputClass = "mt-1.5 h-10 rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]";

interface HolidayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barberId: string | null;
  onSaved: () => void;
}

export function HolidayForm({
  open,
  onOpenChange,
  barberId,
  onSaved,
}: HolidayFormProps) {
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState("FULL_DAY");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormInput>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: {
      type: "FULL_DAY",
    },
  });

  const onSubmit = async (data: HolidayFormInput) => {
    setSaving(true);

    const result = await createHoliday({
      ...data,
      type: type as HolidayType,
      barberId: barberId ?? undefined,
    });

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess("تعطیلی ایجاد شد");
    setSaving(false);
    reset();
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعطیلی جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>عنوان</Label>
            <Input id="title" {...register("title")} className={inputClass} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>تاریخ</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              className={inputClass}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>نوع</Label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_DAY">تمام روز</SelectItem>
                <SelectItem value="TIME_RANGE">بازه زمانی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "TIME_RANGE" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>زمان شروع</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  className={inputClass}
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>زمان پایان</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  className={inputClass}
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button type="submit" disabled={saving} style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }} onClick={handleSubmit(onSubmit)}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            ذخیره
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
