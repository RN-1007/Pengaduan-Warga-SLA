import { CitizenNavbar } from "@/components/layouts/citizen-navbar";
import { BlobCursor } from "@/components/ui/blob-cursor";

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden font-sans w-full">
      <BlobCursor />
      {/* Background Decor aligned to Landing Page Theme */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-[20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-50/50 blur-[100px] -z-10 pointer-events-none" />

      {/* Top Navbar */}
      <CitizenNavbar />

      {/* Main Content Area */}
      <main className="relative z-10 w-full min-h-screen">
        {children}
      </main>
      
      {/* Subtle Footer inside Dashboard */}
      <footer className="py-6 mt-auto text-center border-t border-slate-100 bg-white/50 backdrop-blur-sm">
        <p className="text-xs font-semibold text-slate-400">
          &copy; {new Date().getFullYear()} LaporSLA. Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}