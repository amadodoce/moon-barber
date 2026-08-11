"use client";

import { AdminRouteError } from "@/components/admin/AdminRouteError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AdminRouteError {...props} title="خطا در داشبورد" />;
}
