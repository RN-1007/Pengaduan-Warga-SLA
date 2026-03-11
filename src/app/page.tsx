import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Sistem Pengaduan Warga Berbasis SLA</h1>
      <p className="text-slate-600 mb-8 max-w-md">
        Laporkan masalah lingkungan Anda dan pantau penyelesaiannya secara transparan sesuai standar waktu layanan.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-md">Masuk</Link>
        <Link href="/register" className="px-6 py-2 border border-blue-600 text-blue-600 rounded-md">Daftar</Link>
      </div>
    </div>
  );
}