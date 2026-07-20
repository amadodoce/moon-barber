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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBarberSchema, type CreateBarberInput } from "@/lib/validations/barber";
import { createBarber, updateBarber } from "@/app/actions/barber";
import { showSuccess, showError } from "@/lib/toast";

const inputClass = "mt-1.5 h-10 rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]";

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>نام و نام خانوادگی</Label>
            <Input id="name" {...register("name")} className={inputClass} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {!isEditing && (
            <>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>شماره موبایل</Label>
                <Input
                  id="phone"
                  placeholder="09123456789"
                  {...register("phone")}
                  className={inputClass}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>رمز عبور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  {...register("password")}
                  className={inputClass}
                  dir="ltr"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Label htmlFor="experienceYears" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>سال‌های تجربه (اختیاری)</Label>
            <Input
              id="experienceYears"
              type="number"
              placeholder="مثلاً ۵"
              {...register("experienceYears", { valueAsNumber: true })}
              className={inputClass}
            />
            {errors.experienceYears && (
              <p className="mt-1 text-xs text-red-500">
                {errors.experienceYears.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>بیوگرافی (اختیاری)</Label>
            <Textarea
              id="bio"
              placeholder="درباره آرایشگر..."
              {...register("bio")}
              className={`${inputClass} min-h-[80px]`}
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
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
            className="text-white"
            style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
            onClick={handleSubmit(onSubmit)}
          >
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            {isEditing ? "ذخیره تغییرات" : "ایجاد آرایشگر"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
