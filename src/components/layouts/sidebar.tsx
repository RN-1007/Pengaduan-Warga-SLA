// File: src/components/layouts/sidebar.tsx
import Link from 'next/link';

interface SidebarProps {
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SUPERVISOR';
}

export function Sidebar({ role }: SidebarProps) {
  // Menu dinamis berdasarkan role
  const menuItems = {
    CITIZEN: [
      { label: 'Dashboard', href: '/citizen' },
      { label: 'Riwayat', href: '/citizen/history' },
    ],
    ADMIN: [
      { label: 'Admin Panel', href: '/admin' },
      { label: 'Verifikasi Laporan', href: '/admin/verification' },
      { label: 'Kelola SLA', href: '/admin/sla' },
    ],
    OFFICER: [
      { label: 'Tugas Saya', href: '/officer' },
      { label: 'Update Progres', href: '/officer/updates' },
    ],
    SUPERVISOR: [
      { label: 'Monitoring', href: '/supervisor' },
      { label: 'Eskalasi', href: '/supervisor/escalations' },
    ],
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-8">E-Pengaduan</h2>
      <nav className="space-y-2">
        {menuItems[role].map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className="block p-2 hover:bg-slate-800 rounded transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}