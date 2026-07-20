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
import { createWorkingHourSchema } from "@/lib/validations/working-hour";
import { createWorkingHour } from "@/app/actions/working-hour";
import type { z } from "zod";
import { showSuccess, showError } from "@/lib/toast";
import type { DayOfWeek } from "@/app/generated/prisma/enums";

type WHFormInput = z.input<typeof createWorkingHourSchema>;

const DAYS = [
  { value: "SATURDAY", label: "شنبه" },
  { value: "SUNDAY", label: "یکشنبه" },
  { value: "MONDAY", label: "دوشنبه" },
  { value: "TUESDAY", label: "سه‌شنبه" },
  { value: "WEDNESDAY", label: "چهارشنبه" },
  { value: "THURSDAY", label: "پنجشنبه" },
  { value: "FRIDAY", label: "جمعه" },
];

interface WorkingHourFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barberId: string | null;
  onSaved: () => void;
}

export function WorkingHourForm({
  open,
  onOpenChange,
  barberId,
  onSaved,
}: WorkingHourFormProps) {
  const [saving, setSaving] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState("SATURDAY");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WHFormInput>({
    resolver: zodResolver(createWorkingHourSchema),
    defaultValues: {
      dayOfWeek: "SATURDAY",
      startTime: "09:00",
      endTime: "12:00",
      isRecurring: true,
    },
  });

  const onSubmit = async (data: WHFormInput) => {
    setSaving(true);

    const result = await createWorkingHour({
      ...data,
      dayOfWeek: dayOfWeek as DayOfWeek,
      barberId: barberId ?? undefined,
      isRecurring: data.isRecurring ?? true,
      isActive: data.isActive ?? true,
    });

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess("ساعت کاری ایجاد شد");
    setSaving(false);
    reset();
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ساعات کاری جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>روز هفته</Label>
            <Select value={dayOfWeek} onValueChange={(v) => v && setDayOfWeek(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">زمان شروع</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                className="mt-1"
              />
              {errors.startTime && (
                <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endTime">زمان پایان</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                className="mt-1"
              />
              {errors.endTime && (
                <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving} style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}>
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
