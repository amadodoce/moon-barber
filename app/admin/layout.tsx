import { requireAdminPage } from "@/lib/auth-utils";
import { AdminSidebarProvider } from "@/components/admin/AdminSidebarContext";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <AdminSidebarProvider>
      <div
        className="min-h-screen min-h-dvh"
        style={{ backgroundColor: "var(--color-paper)" }}
      >
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminSidebarProvider>
  );
}
