"use client";

import { useEffect } from "react";
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
import { createServiceSchema } from "@/lib/validations/service";
import type { z } from "zod";
import { createService, updateService } from "@/app/actions/service";
import { useState } from "react";

type ServiceFormInput = z.input<typeof createServiceSchema>;

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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    }
  }, [open, service, reset]);

  const onSubmit = async (data: ServiceFormInput) => {
    setSaving(true);
    setError(null);

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
      setError(result.error || "خطا در ذخیره");
      setSaving(false);
      return;
    }

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">نام سرویس</Label>
            <Input id="name" {...register("name")} className="mt-1" />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationMinutes">مدت زمان (دقیقه)</Label>
              <Input
                id="durationMinutes"
                type="number"
                {...register("durationMinutes", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.durationMinutes && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="price">قیمت (تومان)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">آدرس تصویر (اختیاری)</Label>
            <Input id="imageUrl" {...register("imageUrl")} className="mt-1" />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

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
              ذخیره
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
