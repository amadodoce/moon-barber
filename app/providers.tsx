"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        theme="dark"
        position="bottom-center"
        dir="rtl"
        duration={4000}
        toastOptions={{
          classNames: {
            toast: "!bg-zinc-800 !border-zinc-700 !text-zinc-100 !rounded-xl",
            success: "!border-[#D4A853]/30",
            error: "!border-red-500/30",
            title: "!text-zinc-100",
            description: "!text-zinc-400",
          },
        }}
      />
    </SessionProvider>
  );
}
