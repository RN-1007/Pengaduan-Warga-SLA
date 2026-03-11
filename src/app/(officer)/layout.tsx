import { Sidebar } from "@/components/layouts/sidebar";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar role="OFFICER" />
      <main className="flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  );
}