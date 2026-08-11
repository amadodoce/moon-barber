"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Loader2, UserCheck, UserX, Users } from "lucide-react";
import { getAllBarbers, deleteBarber, activateBarber } from "@/app/actions/barber";
import { BarberDialog } from "@/components/admin/BarberDialog";
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

interface Barber {
  id: string;
  bio: string | null;
  experienceYears: number | null;
  isActive: boolean;
  user: {
    name: string;
    phone: string;
    avatar: string | null;
  };
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    void (async () => {
      const result = await getAllBarbers();
      if (!result.success) {
        setError(result.error || "خطا در بارگذاری");
        setLoading(false);
        return;
      }
      setBarbers(result.data ?? []);
      setLoading(false);
    })();
  }, []);

  const loadBarbers = async () => {
    const result = await getAllBarbers();
    if (!result.success) {
      setError(result.error || "خطا در بارگذاری");
      return;
    }
    setBarbers(result.data ?? []);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    const result = await deleteBarber({ id });
    if (!result.success) {
      showError(result.error || "خطا در غیرفعال کردن");
    } else {
      setBarbers((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: false } : b))
      );
      showSuccess("آرایشگر غیرفعال شد");
    }
    setActionLoading(null);
  };

  const handleActivate = async (id: string) => {
    setActionLoading(id);
    const result = await activateBarber({ id });
    if (!result.success) {
      showError(result.error || "خطا در فعال کردن");
    } else {
      setBarbers((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: true } : b))
      );
      showSuccess("آرایشگر فعال شد");
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="space-y-[var(--space-md)]">
        <PageHeader title="مدیریت آرایشگرها" eyebrow="پیکربندی" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-[var(--space-md)]">
      <PageHeader
        title="مدیریت آرایشگرها"
        description="افزودن، ویرایش و فعال‌سازی آرایشگران"
        eyebrow="پیکربندی"
        actions={
          <Button
            onClick={() => {
              setEditingBarber(null);
              setDialogOpen(true);
            }}
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-accent-ink)",
            }}
          >
            <Plus className="ml-2 h-4 w-4" />
            آرایشگر جدید
          </Button>
        }
      />

      {error ? <ErrorMessage message={error} /> : null}

      <SurfaceCard padding="none">
        {barbers.length === 0 ? (
          <div className="p-[var(--space-md)]">
            <EmptyState
              title="هنوز آرایشگری تعریف نشده است"
              icon={<Users className="h-8 w-8" />}
              action={{
                label: "افزودن آرایشگر",
                onClick: () => {
                  setEditingBarber(null);
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
                  <TableHead>شماره تماس</TableHead>
                  <TableHead>تجربه</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barbers.map((barber) => (
                  <TableRow key={barber.id}>
                    <TableCell className="font-medium text-[var(--color-ink)]">
                      {barber.user.name}
                    </TableCell>
                    <TableCell dir="ltr" className="text-left">
                      {barber.user.phone}
                    </TableCell>
                    <TableCell>
                      {barber.experienceYears
                        ? `${barber.experienceYears} سال`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={barber.isActive ? "فعال" : "غیرفعال"}
                        bgVar={
                          barber.isActive
                            ? "var(--status-confirmed-bg)"
                            : "var(--color-paper-3)"
                        }
                        fgVar={
                          barber.isActive
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
                            setEditingBarber(barber);
                            setDialogOpen(true);
                          }}
                          aria-label={`ویرایش ${barber.user.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {barber.isActive ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmAction({
                                open: true,
                                title: "غیرفعال کردن آرایشگر",
                                description:
                                  "آیا از غیرفعال کردن این آرایشگر اطمینان دارید؟",
                                onConfirm: () => handleDelete(barber.id),
                              })
                            }
                            disabled={actionLoading === barber.id}
                            aria-label={`غیرفعال کردن ${barber.user.name}`}
                          >
                            {actionLoading === barber.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserX className="h-4 w-4 text-[var(--status-failed-fg)]" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmAction({
                                open: true,
                                title: "فعال کردن آرایشگر",
                                description:
                                  "آیا از فعال کردن این آرایشگر اطمینان دارید؟",
                                onConfirm: () => handleActivate(barber.id),
                              })
                            }
                            disabled={actionLoading === barber.id}
                            aria-label={`فعال کردن ${barber.user.name}`}
                          >
                            {actionLoading === barber.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-[var(--status-confirmed-fg)]" />
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SurfaceCard>

      <BarberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        barber={
          editingBarber
            ? {
                id: editingBarber.id,
                name: editingBarber.user.name,
                bio: editingBarber.bio,
                experienceYears: editingBarber.experienceYears,
              }
            : null
        }
        onSaved={() => {
          setDialogOpen(false);
          void loadBarbers();
        }}
      />

      <ConfirmDialog
        open={confirmAction.open}
        onOpenChange={(open) =>
          setConfirmAction((prev) => ({ ...prev, open }))
        }
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel="تأیید"
        onConfirm={confirmAction.onConfirm}
        loading={!!actionLoading}
      />
    </div>
  );
}
