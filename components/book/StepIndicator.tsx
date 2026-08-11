"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/stores/booking";

const steps = [
  { num: 1, label: "انتخاب سرویس", route: "/book" },
  { num: 2, label: "انتخاب آرایشگر", route: "/book/barber" },
  { num: 3, label: "تاریخ و ساعت", route: "/book/date-time" },
  { num: 4, label: "تأیید و پرداخت", route: "/book/summary" },
] as const;

export function StepIndicator() {
  const router = useRouter();
  const currentStep = useBookingStore((s) => s.step);
  const setStep = useBookingStore((s) => s.setStep);

  const goToStep = (stepNum: 1 | 2 | 3 | 4) => {
    if (currentStep <= stepNum) return;
    setStep(stepNum);
    router.push(steps[stepNum - 1].route);
  };

  return (
    <div
      className="mx-auto flex w-full max-w-2xl items-center justify-between"
      aria-label="مراحل رزرو"
    >
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;
        const isEditable = isCompleted;

        return (
          <div key={step.num} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {isEditable ? (
                <button
                  type="button"
                  aria-label={`بازگشت به ${step.label}`}
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => goToStep(step.num)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-[var(--dur-short)]",
                    "bg-[var(--color-accent)] text-[var(--color-accent-ink)]",
                    "hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)]"
                  )}
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              ) : (
                <div
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-[var(--dur-short)]",
                    isActive
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] ring-4 ring-[var(--color-accent-soft)] animate-[pulse-glow_2s_ease-in-out_infinite]"
                      : "bg-[var(--color-paper-3)] text-[var(--color-ink-muted)]"
                  )}
                >
                  {step.num}
                </div>
              )}
              <span
                className={cn(
                  "hidden text-xs font-medium transition-colors duration-[var(--dur-medium)] sm:block",
                  isActive || isCompleted
                    ? "text-[var(--color-accent)]"
                    : "text-[var(--color-ink-faint)]"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={cn(
                  "mx-2 mt-[-1rem] h-[3px] flex-1 rounded-full transition-colors duration-500 sm:mt-0",
                  isCompleted ? "bg-[var(--color-accent)]" : "bg-[var(--color-paper-3)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
