"use client";

import { useBookingStore } from "@/stores/booking";

const steps = [
  { num: 1, label: "انتخاب سرویس" },
  { num: 2, label: "انتخاب آرایشگر" },
  { num: 3, label: "تاریخ و ساعت" },
  { num: 4, label: "تأیید و پرداخت" },
];

export function StepIndicator() {
  const currentStep = useBookingStore((s) => s.step);

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto px-4">
      {steps.map((step, i) => {
        const isActive = currentStep === step.num;
        const isCompleted = currentStep > step.num;

        return (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-amber-500 text-white"
                    : isActive
                      ? "bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-900/50"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-1rem] sm:mt-0 ${
                  isCompleted ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
