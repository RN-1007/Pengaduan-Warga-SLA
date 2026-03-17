// File: src/app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-8 bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Sistem Pengaduan Warga <br className="hidden sm:block" />
            <span className="text-blue-600">Berbasis SLA</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Laporkan masalah infrastruktur dan lingkungan di sekitar Anda. Kami menjamin transparansi 
            dan penyelesaian tepat waktu sesuai Standar Layanan (SLA).
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/citizen">
            <Button size="lg" className="w-full sm:w-auto font-semibold shadow-md">
              Masuk ke Dashboard
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
              Daftar Akun Baru
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}