// File: src/app/layout.tsx
import "./globals.css"; // <-- BARIS INI WAJIB ADA
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "E-Pengaduan Warga",
  description: "Sistem Pengaduan Warga Berbasis SLA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}