import { requireAdminPage } from "@/lib/auth-utils";
import { AdminHeader, AdminSidebarSpacer } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminPage();

  return (
    <div className="min-h-screen min-h-dvh" style={{ backgroundColor: "var(--surface-base)" }}>
      <AdminHeader />
      <div className="flex">
        <AdminSidebarSpacer />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
