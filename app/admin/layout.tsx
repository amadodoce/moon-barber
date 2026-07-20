import { requireAdminPage } from "@/lib/auth-utils";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen min-h-dvh" style={{ backgroundColor: "var(--surface-base)" }}>
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
