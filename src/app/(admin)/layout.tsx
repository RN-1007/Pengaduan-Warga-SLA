import { Sidebar } from "@/components/layouts/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="ADMIN" />
      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  );
}

