# Pengaduan Warga SLA 🚀

Sistem manajemen pengaduan warga modern yang dibangun dengan **Next.js**, **Supabase**, dan **shadcn/ui**. Proyek ini dirancang untuk menangani laporan warga dengan sistem Service Level Agreement (SLA) yang dinamis..

## 🛠️ Stack Teknologi

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **State Management:** [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion
- **Icons:** Lucide React

## 📋 Prasyarat

Pastikan Anda sudah menginstal:
- Node.js 20.x atau lebih baru
- npm / yarn / pnpm

## 🚀 Persiapan Awal (Setup)

### 1. Clone Repositori
```bash
git clone <url-repository-anda>
cd pengaduan-warga-sla
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local` dan isi kredensial Supabase Anda:
```bash
cp .env.example .env.local
```

Isi variabel berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 🎨 Menggunakan shadcn/ui

Proyek ini menggunakan **shadcn/ui**. Untuk menambahkan komponen baru, gunakan perintah `npx shadcn@latest add`:

```bash
npx shadcn@latest add [component-name]
```

Contoh:
```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

Komponen yang sudah diinstal akan berada di direktori `src/components/ui/`.

## 📁 Struktur Direktori

- `src/app`: Routing dan Page (App Router)
- `src/components`: Komponen UI reusable (termasuk shadcn/ui di folder `ui`)
- `src/modules`: Logika fitur spesifik (Admin, Auth, Complaints, dll)
- `src/lib`: Konfigurasi library (Supabase client, Utils)
- `src/hooks`: Custom React hooks
- `src/services`: API calls dan integrasi eksternal
- `src/repositories`: Abstraksi akses data

## 📜 Skrip yang Tersedia

- `npm run dev`: Menjalankan aplikasi dalam mode pengembangan.
- `npm run build`: Membangun aplikasi untuk produksi.
- `npm run start`: Menjalankan aplikasi hasil build produksi.
- `npm run lint`: Menjalankan pengecekan ESLint.

## 🤝 Kontribusi

Silakan buat *pull request* untuk berkontribusi. Pastikan untuk mengikuti standar coding yang sudah ada.

---
Dibangun dengan ❤️ untuk pelayanan warga yang lebih baik.
