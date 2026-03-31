import { Sidebar } from "@/components/layouts/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-[#f8fafc] min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <Sidebar role="ADMIN" />
      <main className="flex-1 h-screen overflow-y-auto w-full relative">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-slate-200/50 to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

