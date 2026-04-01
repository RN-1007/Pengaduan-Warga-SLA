"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Tags, 
  ClipboardList, 
  Activity, 
  ShieldAlert,
  LogOut,
  MapPin,
  UserCheck
} from 'lucide-react'
import { authService } from '@/modules/auth/services/auth.service'

interface SidebarProps {
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER' | 'SUPERVISOR'
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const menuItems = {
    CITIZEN: [
      { label: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
      { label: 'Riwayat', href: '/citizen/history', icon: ClipboardList },
    ],
    ADMIN: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Verifikasi Laporan', href: '/admin/verification', icon: CheckSquare },
      { label: 'Assign Tugas Officer', href: '/admin/assignments', icon: UserCheck },
      { label: 'Manajemen Pengguna', href: '/admin/users', icon: Users },
      { label: 'Kategori & Kondisi', href: '/admin/categories', icon: Tags },
    ],
    OFFICER: [
      { label: 'Tugas Saya', href: '/officer', icon: ClipboardList },
      { label: 'Update Progres', href: '/officer/updates', icon: MapPin },
    ],
    SUPERVISOR: [
      { label: 'Monitoring Center', href: '/supervisor', icon: Activity },
      { label: 'Eskalasi SLA', href: '/supervisor/escalations', icon: ShieldAlert },
    ],
  }

  const items = menuItems[role] || []

  const handleLogout = async () => {
    await authService.logout()
    router.push('/auth/login')
  }

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen flex flex-col transition-all duration-300 relative z-20 shadow-2xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-8 border-b border-slate-800/60 font-bold text-xl tracking-tight text-white gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 text-white">
          <span className="text-lg">L</span>
        </div>
        LaporSLA
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
        <div className="px-4 mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Menu Utama ({role})
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-200' : 'text-slate-500'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-800/60">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 font-medium hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Keluar Sistem
        </button>
      </div>
    </aside>
  )
}