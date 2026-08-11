import { getServices } from "@/app/actions/service";
import { BookServicesClient } from "@/components/book/BookServicesClient";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default async function BookPage() {
  const result = await getServices();

  if (!result.success) {
    return (
      <ErrorMessage
        message={result.error || "خطا در بارگذاری سرویس‌ها"}
        className="mt-[var(--space-md)]"
      />
    );
  }

  const services = (result.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    price: Number(s.price),
    imageUrl: s.imageUrl,
  }));

  return <BookServicesClient services={services} />;
}
