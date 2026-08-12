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
import { createHolidaySchema } from "@/lib/validations/holiday";
import { createHoliday, updateHoliday } from "@/app/actions/holiday";
import { JalaliDateField } from "@/components/admin/JalaliDateField";
import type { z } from "zod";
import { showSuccess, showError } from "@/lib/toast";
import type { HolidayType } from "@/app/generated/prisma/enums";
import type { HolidayRow } from "@/components/admin/ScheduleView";
import { toDateString } from "@/lib/booking/timezone";

type HolidayFormInput = z.input<typeof createHolidaySchema>;

const inputClass =
  "mt-1.5 h-10 rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)]";

interface HolidayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barberId: string | null;
  editItem?: HolidayRow | null;
  onSaved: () => void;
}

function defaultValues(editItem?: HolidayRow | null): HolidayFormInput {
  if (editItem) {
    return {
      title: editItem.title,
      date: toDateString(editItem.date),
      type: editItem.type as HolidayType,
      startTime: editItem.startTime ?? undefined,
      endTime: editItem.endTime ?? undefined,
    };
  }
  return { type: "FULL_DAY", title: "", date: "" };
}

function HolidayFormInner({
  barberId,
  editItem,
  onSaved,
  onOpenChange,
}: Omit<HolidayFormProps, "open">) {
  const [saving, setSaving] = useState(false);
  const isEdit = !!editItem;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<HolidayFormInput>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: defaultValues(editItem),
  });

  const type = watch("type") ?? "FULL_DAY";

  const onSubmit = async (data: HolidayFormInput) => {
    setSaving(true);

    const payload = {
      ...data,
      type: (data.type ?? "FULL_DAY") as HolidayType,
      barberId: barberId ?? undefined,
    };

    const result = isEdit
      ? await updateHoliday({ id: editItem!.id, ...payload })
      : await createHoliday(payload);

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess(isEdit ? "تعطیلی به‌روزرسانی شد" : "تعطیلی ایجاد شد");
    setSaving(false);
    onSaved();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
        <div>
          <Label htmlFor="title">عنوان</Label>
          <Input id="title" {...register("title")} className={inputClass} />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <JalaliDateField
              value={field.value ?? ""}
              onChange={field.onChange}
              error={errors.date?.message}
            />
          )}
        />

        <div>
          <Label>نوع</Label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? "FULL_DAY"}
                onValueChange={(v) => v && field.onChange(v as HolidayType)}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_DAY">تمام روز</SelectItem>
                  <SelectItem value="TIME_RANGE">بازه زمانی</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {type === "TIME_RANGE" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">زمان شروع</Label>
              <Input id="startTime" type="time" {...register("startTime")} className={inputClass} />
            </div>
            <div>
              <Label htmlFor="endTime">زمان پایان</Label>
              <Input id="endTime" type="time" {...register("endTime")} className={inputClass} />
            </div>
          </div>
        )}
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

export function HolidayForm({
  open,
  onOpenChange,
  barberId,
  editItem,
  onSaved,
}: HolidayFormProps) {
  const formKey = editItem?.id ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editItem ? "ویرایش تعطیلی" : "تعطیلی جدید"}</DialogTitle>
        </DialogHeader>
        {open && (
          <HolidayFormInner
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
