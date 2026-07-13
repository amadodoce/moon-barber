"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { getAllServices, deleteService } from "@/app/actions/service";
import { ServiceDialog } from "@/components/admin/ServiceDialog";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: unknown;
  isActive: boolean;
  imageUrl: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadServices = async () => {
    const result = await getAllServices();
    if (!result.success) {
      setError(result.error || "خطا در بارگذاری");
      return;
    }
    setServices((result.data ?? []) as Service[]);
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteService({ id });
    if (!result.success) {
      setError(result.error || "خطا در حذف");
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
    }
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
        <h1 className="text-2xl font-bold text-zinc-900">مدیریت سرویس‌ها</h1>
        <Button
          onClick={() => {
            setEditingService(null);
            setDialogOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Plus className="ml-2 h-4 w-4" />
          سرویس جدید
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-2xl bg-white border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>مدت زمان</TableHead>
              <TableHead>قیمت</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.durationMinutes} دقیقه</TableCell>
                <TableCell>
                  {Number(service.price).toLocaleString("fa-IR")} تومان
                </TableCell>
                <TableCell>
                  <Badge
                    variant={service.isActive ? "default" : "secondary"}
                    className={
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }
                  >
                    {service.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingService(service);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      disabled={deleting === service.id}
                    >
                      {deleting === service.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-400">
                  سرویسی تعریف نشده است
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSaved={() => {
          setDialogOpen(false);
          loadServices();
        }}
      />
    </div>
  );
}
