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
import { createServiceSchema } from "@/lib/validations/service";
import type { z } from "zod";
import { createService, updateService } from "@/app/actions/service";
import { showSuccess, showError } from "@/lib/toast";

type ServiceFormInput = z.input<typeof createServiceSchema>;

const inputClass = "mt-1.5 h-10 rounded-xl border-[var(--surface-border)] bg-[var(--surface-base)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[var(--booking-gold)] focus:ring-[var(--booking-gold)]";

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: unknown;
    imageUrl: string | null;
  } | null;
  onSaved: () => void;
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  onSaved,
}: ServiceDialogProps) {
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormInput>({
    resolver: zodResolver(createServiceSchema),
  });

  useEffect(() => {
    if (open) {
      if (service) {
        reset({
          name: service.name,
          description: service.description ?? "",
          durationMinutes: service.durationMinutes,
          price: Number(service.price),
          imageUrl: service.imageUrl ?? "",
        });
      } else {
        reset({
          name: "",
          description: "",
          durationMinutes: 30,
          price: 0,
          imageUrl: "",
        });
      }
    }
  }, [open, service, reset]);

  const onSubmit = async (data: ServiceFormInput) => {
    setSaving(true);

    const result = service
      ? await updateService({ ...data, id: service.id })
      : await createService({
          name: data.name,
          durationMinutes: data.durationMinutes,
          price: data.price,
          description: data.description,
          imageUrl: data.imageUrl,
          isActive: data.isActive ?? true,
        });

    if (!result.success) {
      showError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

    showSuccess(service ? "سرویس بروزرسانی شد" : "سرویس ایجاد شد");
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {service ? "ویرایش سرویس" : "سرویس جدید"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>نام سرویس</Label>
            <Input id="name" {...register("name")} className={inputClass} />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>توضیحات</Label>
            <Textarea
              id="description"
              {...register("description")}
              className={`${inputClass} min-h-[80px]`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationMinutes" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>مدت زمان (دقیقه)</Label>
              <Input
                id="durationMinutes"
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.durationMinutes && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="price" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>قیمت (تومان)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>آدرس تصویر (اختیاری)</Label>
            <Input id="imageUrl" {...register("imageUrl")} className={inputClass} />
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
            ذخیره
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
