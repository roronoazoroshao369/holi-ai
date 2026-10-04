import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holi DevOps Lab",
  description: "Learn DevOps from fundamentals to production through guided practice."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
