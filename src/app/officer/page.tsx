"use client"

import { useQuery } from '@tanstack/react-query'
import { getAllComplaintsAction } from '@/modules/complaints/actions/complaints.actions'
import { AdminComplaintTable } from '@/modules/complaints/components/admin-complaint-table'
import { authService } from '@/modules/auth/services/auth.service'
import { motion } from 'framer-motion'
import { Shield, ClipboardList, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function OfficerDashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: () => getAllComplaintsAction()
  });

  const activeTasks = complaints?.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length || 0;
  const resolved = complaints?.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length || 0;

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  }
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Officer Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Daftar tugas pengaduan yang harus Anda tangani</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid gap-4 md:grid-cols-3"
      >
        {[
          { label: 'Tugas Aktif', value: activeTasks, bg: 'bg-blue-50', text: 'text-blue-700', icon: <AlertTriangle className="w-5 h-5 text-blue-400" /> },
          { label: 'Selesai', value: resolved, bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
          { label: 'Total Laporan', value: complaints?.length || 0, bg: 'bg-slate-50', text: 'text-slate-700', icon: <ClipboardList className="w-5 h-5 text-slate-400" /> },
        ].map((stat) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h2 className={`text-3xl font-bold ${stat.text}`}>{stat.value}</h2>
              </div>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Tugas Laporan Anda</h2>
        </div>
        <div className="p-6">
          <AdminComplaintTable complaints={complaints || []} isLoading={isLoading} />
        </div>
      </motion.div>
    </div>
  )
}
