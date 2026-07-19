import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Barber Shop",
  description: "سیستم رزرو نوبت آرایشگاه مردانه",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
