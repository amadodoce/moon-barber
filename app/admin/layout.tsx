import { requireAdminPage } from "@/lib/auth-utils";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all admin routes — redirects if not admin
  await requireAdminPage();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
