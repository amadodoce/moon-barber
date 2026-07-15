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
import { createHolidaySchema } from "@/lib/validations/holiday";
import { createHoliday } from "@/app/actions/holiday";
import type { z } from "zod";
import { showSuccess, showError } from "@/lib/toast";

type HolidayFormInput = z.input<typeof createHolidaySchema>;

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
      type: type as any,
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان</Label>
            <Input id="title" {...register("title")} className="mt-1" />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">تاریخ</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              className="mt-1"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label>نوع</Label>
            <Select value={type} onValueChange={(v) => v && setType(v)}>
              <SelectTrigger className="mt-1">
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
                <Label htmlFor="startTime">زمان شروع</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime">زمان پایان</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving} className="bg-amber-500 hover:bg-amber-600">
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
