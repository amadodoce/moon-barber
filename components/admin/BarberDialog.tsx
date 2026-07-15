"use client";

import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createBarberSchema, type CreateBarberInput } from "@/lib/validations/barber";
import { createBarber, updateBarber } from "@/app/actions/barber";
import { showSuccess, showError } from "@/lib/toast";

interface BarberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barber?: {
    id: string;
    name: string;
    bio: string | null;
    experienceYears: number | null;
  } | null;
  onSaved: () => void;
}

export function BarberDialog({
  open,
  onOpenChange,
  barber,
  onSaved,
}: BarberDialogProps) {
  const [saving, setSaving] = useState(false);
  const isEditing = !!barber;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBarberInput>({
    resolver: zodResolver(createBarberSchema),
  });

  useEffect(() => {
    if (open) {
      if (barber) {
        reset({
          name: barber.name,
          phone: "",
          password: "",
          bio: barber.bio ?? "",
          experienceYears: barber.experienceYears ?? undefined,
        });
      } else {
        reset({
          name: "",
          phone: "",
          password: "",
          bio: "",
          experienceYears: undefined,
        });
      }
    }
  }, [open, barber, reset]);

  const onSubmit = async (data: CreateBarberInput) => {
    setSaving(true);

    let result;
    if (isEditing) {
      result = await updateBarber({
        id: barber.id,
        name: data.name,
        bio: data.bio,
        experienceYears: data.experienceYears,
      });
    } else {
      result = await createBarber(data);
    }

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess(isEditing ? "آرایشگر بروزرسانی شد" : "آرایشگر ایجاد شد");
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "ویرایش آرایشگر" : "آرایشگر جدید"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">نام و نام خانوادگی</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {!isEditing && (
            <>
              <div>
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input
                  id="phone"
                  placeholder="09123456789"
                  {...register("phone")}
                  className="mt-1"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  {...register("password")}
                  className="mt-1"
                  dir="ltr"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="experienceYears">سال‌های تجربه (اختیاری)</Label>
            <Input
              id="experienceYears"
              type="number"
              placeholder="مثلاً ۵"
              {...register("experienceYears", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.experienceYears && (
              <p className="mt-1 text-xs text-red-500">
                {errors.experienceYears.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bio">بیوگرافی (اختیاری)</Label>
            <Textarea
              id="bio"
              placeholder="درباره آرایشگر..."
              {...register("bio")}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {isEditing ? "ذخیره تغییرات" : "ایجاد آرایشگر"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
