"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Loader2, UserCheck, UserX } from "lucide-react";
import { getAllBarbers, deleteBarber, activateBarber } from "@/app/actions/barber";
import { BarberDialog } from "@/components/admin/BarberDialog";
import { Spinner } from "@/components/ui/Spinner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">مدیریت آرایشگرها</h1>
        <Button
          onClick={() => {
            setEditingBarber(null);
            setDialogOpen(true);
          }}
          style={{ backgroundColor: "var(--booking-gold)", color: "var(--surface-base)" }}
        >
          <Plus className="ml-2 h-4 w-4" />
          آرایشگر جدید
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
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
                <TableCell className="font-medium">{barber.user.name}</TableCell>
                <TableCell dir="ltr" className="text-left">
                  {barber.user.phone}
                </TableCell>
                <TableCell>
                  {barber.experienceYears
                    ? `${barber.experienceYears} سال`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={barber.isActive ? "default" : "secondary"}
                    className={
                      barber.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-zinc-100 text-zinc-500"
                    }
                  >
                    {barber.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
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
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {barber.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmAction({
                          open: true,
                          title: "غیرفعال کردن آرایشگر",
                          description: "آیا از غیرفعال کردن این آرایشگر اطمینان دارید؟",
                          onConfirm: () => handleDelete(barber.id),
                        })}
                        disabled={actionLoading === barber.id}
                      >
                        {actionLoading === barber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmAction({
                          open: true,
                          title: "فعال کردن آرایشگر",
                          description: "آیا از فعال کردن این آرایشگر اطمینان دارید؟",
                          onConfirm: () => handleActivate(barber.id),
                        })}
                        disabled={actionLoading === barber.id}
                      >
                        {actionLoading === barber.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {barbers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-zinc-400">
                  هنوز آرایشگری تعریف نشده است
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <BarberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        barber={editingBarber ? {
          id: editingBarber.id,
          name: editingBarber.user.name,
          bio: editingBarber.bio,
          experienceYears: editingBarber.experienceYears,
        } : null}
        onSaved={() => {
          setDialogOpen(false);
          loadBarbers();
        }}
      />

      <ConfirmDialog
        open={confirmAction.open}
        onOpenChange={(open) => setConfirmAction(prev => ({ ...prev, open }))}
        title={confirmAction.title}
        description={confirmAction.description}
        confirmLabel="تأیید"
        onConfirm={confirmAction.onConfirm}
        loading={!!actionLoading}
      />
    </div>
  );
}
