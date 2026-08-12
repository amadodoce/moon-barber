"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { createWorkingHourSchema } from "@/lib/validations/working-hour";
import { createWorkingHour, updateWorkingHour } from "@/app/actions/working-hour";
import type { z } from "zod";
import { showSuccess, showError } from "@/lib/toast";
import type { DayOfWeek } from "@/app/generated/prisma/enums";
import type { WorkingHourRow } from "@/components/admin/ScheduleView";

type WHFormInput = z.input<typeof createWorkingHourSchema>;

const inputClass =
  "mt-1.5 h-10 rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)]";

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
  editItem?: WorkingHourRow | null;
  onSaved: () => void;
}

function defaultValues(editItem?: WorkingHourRow | null): WHFormInput {
  if (editItem) {
    return {
      dayOfWeek: editItem.dayOfWeek as WHFormInput["dayOfWeek"],
      startTime: editItem.startTime,
      endTime: editItem.endTime,
      isRecurring: editItem.isRecurring,
      specificDate: editItem.specificDateStr ?? undefined,
    };
  }
  return {
    dayOfWeek: "SATURDAY",
    startTime: "09:00",
    endTime: "12:00",
    isRecurring: true,
  };
}

function WorkingHourFormInner({
  barberId,
  editItem,
  onSaved,
  onOpenChange,
}: Omit<WorkingHourFormProps, "open">) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!editItem;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WHFormInput>({
    resolver: zodResolver(createWorkingHourSchema),
    defaultValues: defaultValues(editItem),
  });

  const onSubmit = async (data: WHFormInput) => {
    setSaving(true);

    const result = isEdit
      ? await updateWorkingHour({
          id: editItem!.id,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
          isRecurring: data.isRecurring ?? true,
          specificDate: data.specificDate ?? null,
        })
      : await createWorkingHour({
          ...data,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
          barberId: barberId ?? undefined,
          isRecurring: data.isRecurring ?? true,
          isActive: data.isActive ?? true,
        });

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess(isEdit ? "ساعت کاری به‌روزرسانی شد" : "ساعت کاری ایجاد شد");
    setSaving(false);
    onSaved();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
        <div>
          <Label className="text-sm font-medium">روز هفته</Label>
          <Controller
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                <SelectTrigger className={inputClass}>
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
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">زمان شروع</Label>
            <Input id="startTime" type="time" {...register("startTime")} className={inputClass} />
            {errors.startTime && (
              <p className="mt-1 text-xs text-red-500">{errors.startTime.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="endTime">زمان پایان</Label>
            <Input id="endTime" type="time" {...register("endTime")} className={inputClass} />
            {errors.endTime && (
              <p className="mt-1 text-xs text-red-500">{errors.endTime.message}</p>
            )}
          </div>
        </div>
      </form>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          انصراف
        </Button>
        <Button type="submit" disabled={saving} onClick={handleSubmit(onSubmit)}>
          {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          ذخیره
        </Button>
      </DialogFooter>
    </>
  );
}

export function WorkingHourForm({
  open,
  onOpenChange,
  barberId,
  editItem,
  onSaved,
}: WorkingHourFormProps) {
  const formKey = editItem?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "ویرایش ساعات کاری" : "ساعات کاری جدید"}</DialogTitle>
        </DialogHeader>
        {open && (
          <WorkingHourFormInner
            key={formKey}
            barberId={barberId}
            editItem={editItem}
            onSaved={onSaved}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
