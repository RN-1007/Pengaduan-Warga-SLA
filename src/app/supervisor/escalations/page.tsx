"use client"

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth.service'
import { EscalationBoard } from '@/modules/supervisor/components/escalation-board'
import { motion } from 'framer-motion'
import { ShieldAlert, Loader2 } from 'lucide-react'

export default function SupervisorEscalationsPage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Double auth protection
  if (!user || user.profile?.role !== 'SUPERVISOR') {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Akses Terlarang</h2>
        <p className="text-slate-500 mt-2">Halaman Eskalasi SLA ini hanya dapat diakses oleh akun Supervisor.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-red-50 border border-red-100 shadow-sm rounded-xl">
          <ShieldAlert className="w-7 h-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Eskalasi & Intevensi SLA</h1>
          <p className="text-slate-500 text-sm mt-1">
            Pusat kendali laporan bermasalah. Intervensi dan ambil keputusan untuk laporan yang melewati batas waktu.
          </p>
        </div>
      </motion.div>

      <div className="pt-4">
        <EscalationBoard currentUserId={user.id} />
      </div>
    </div>
  )
}
