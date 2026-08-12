import { getBarbers } from "@/app/actions/barber";
import { BookBarberClient } from "@/components/book/BookBarberClient";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default async function BarberPage() {
  const result = await getBarbers();

  if (!result.success) {
    return (
      <ErrorMessage
        message={result.error || "خطا در بارگذاری آرایشگرها"}
        className="mt-[var(--space-md)]"
      />
    );
  }

  return <BookBarberClient barbers={result.data ?? []} />;
}
