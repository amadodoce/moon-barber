"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Scissors } from "lucide-react";
import { getAllServices, deleteService } from "@/app/actions/service";
import { ServiceDialog } from "@/components/admin/ServiceDialog";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { showSuccess, showError } from "@/lib/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  EmptyState,
  PageHeader,
  Skeleton,
  StatusBadge,
  SurfaceCard,
} from "@/components/brand";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string | null;
  }>({ open: false, id: null });

  useEffect(() => {
    void (async () => {
      const result = await getAllServices();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری");
        setLoading(false);
        return;
      }
      setServices((result.data ?? []) as Service[]);
      setLoading(false);
    })();
  }, []);

  const loadServices = async () => {
    const result = await getAllServices();
    if (!result.success) return;
    setServices((result.data ?? []) as Service[]);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const result = await deleteService({ id });
    if (!result.success) {
      showError(result.error || "خطا در حذف");
    } else {
      setServices((prev) => prev.filter((s) => s.id !== id));
      showSuccess("سرویس حذف شد");
    }
    setDeleting(null);
    setDeleteConfirm({ open: false, id: null });
  };

  if (loading) {
    return (
      <div className="space-y-[var(--space-md)]">
        <PageHeader title="مدیریت سرویس‌ها" eyebrow="پیکربندی" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="مدیریت سرویس‌ها"
        description="تعریف و ویرایش سرویس‌های آرایشگاه"
        eyebrow="پیکربندی"
        actions={
          <Button
            onClick={() => {
              setEditingService(null);
              setDialogOpen(true);
            }}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-ink)",
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            سرویس جدید
          </Button>
        }
      />

      {error ? <ErrorMessage message={error} /> : null}

      <SurfaceCard padding="none">
        {services.length === 0 ? (
          <div className="p-[var(--space-md)]">
            <EmptyState
              title="سرویسی تعریف نشده است"
              icon={<Scissors className="h-8 w-8" />}
              action={{
                label: "افزودن سرویس",
                onClick: () => {
                  setEditingService(null);
                  setDialogOpen(true);
                },
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[500px]">
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
                    <TableCell className="font-medium text-[var(--color-ink)]">
                      {service.name}
                    </TableCell>
                    <TableCell>{service.durationMinutes} دقیقه</TableCell>
                    <TableCell>
                      {Number(service.price).toLocaleString("fa-IR")} تومان
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={service.isActive ? "فعال" : "غیرفعال"}
                        bgVar={
                          service.isActive
                            ? "var(--status-confirmed-bg)"
                            : "var(--color-paper-3)"
                        }
                        fgVar={
                          service.isActive
                            ? "var(--status-confirmed-fg)"
                            : "var(--color-ink-muted)"
                        }
                      />
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
                          aria-label={`ویرایش ${service.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirm({ open: true, id: service.id })
                          }
                          disabled={deleting === service.id}
                          aria-label={`حذف ${service.name}`}
                        >
                          {deleting === service.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-[var(--status-failed-fg)]" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SurfaceCard>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        onSaved={() => {
          setDialogOpen(false);
          void loadServices();
        }}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          setDeleteConfirm({ open, id: deleteConfirm.id })
        }
        title="حذف سرویس"
        description="آیا از حذف این سرویس اطمینان دارید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        onConfirm={() => deleteConfirm.id && handleDelete(deleteConfirm.id)}
        loading={deleting === deleteConfirm.id}
      />
    </div>
  );
}
