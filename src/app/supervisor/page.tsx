"use client"

import { useQuery } from '@tanstack/react-query'
import { getAllComplaintsAction } from '@/modules/complaints/actions/complaints.actions'
import { AdminComplaintTable } from '@/modules/complaints/components/admin-complaint-table'
import { authService } from '@/modules/auth/services/auth.service'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { 
  BarChart3, ClipboardList, Clock, AlertTriangle, CheckCircle2, 
  ShieldAlert, TrendingUp, Activity 
} from 'lucide-react'

export default function SupervisorDashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: () => getAllComplaintsAction()
  });

  // Analytics
  const total = complaints?.length || 0;
  const processed = complaints?.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'VERIFIED').length || 0;
  const resolved = complaints?.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length || 0;
  const escalated = complaints?.filter(c => c.is_escalated).length || 0;
  
  const complianceRate = total > 0 ? Math.round(((total - escalated) / total) * 100) : 100;

  // Average completion time
  let totalHours = 0;
  let resolvedCountForAvg = 0;
  if (complaints) {
    complaints.forEach(c => {
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        const created = new Date(c.created_at).getTime();
        const updated = new Date(c.updated_at).getTime();
        totalHours += (updated - created) / (1000 * 60 * 60);
        resolvedCountForAvg++;
      }
    });
  }
  const avgResolutionTime = resolvedCountForAvg > 0 ? (totalHours / resolvedCountForAvg).toFixed(1) : 0;

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Supervisor Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor kinerja penanganan, eskalasi sistem, dan SLA</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
      >
        {[
          { label: 'Total Pengaduan', value: total, bg: 'bg-blue-50', text: 'text-blue-700', icon: <ClipboardList className="w-5 h-5 text-blue-400" /> },
          { label: 'Sedang Diproses', value: processed, bg: 'bg-cyan-50', text: 'text-cyan-700', icon: <Activity className="w-5 h-5 text-cyan-400" /> },
          { label: 'Selesai', value: resolved, bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
          { label: 'Kepatuhan SLA', value: `${complianceRate}%`, bg: complianceRate >= 80 ? 'bg-green-50' : 'bg-red-50', text: complianceRate >= 80 ? 'text-green-700' : 'text-red-600', icon: <TrendingUp className="w-5 h-5" style={{ color: complianceRate >= 80 ? '#22c55e' : '#ef4444' }} /> },
          { label: 'Eskalasi', value: escalated, bg: 'bg-red-50', text: 'text-red-600', icon: <ShieldAlert className="w-5 h-5 text-red-400" /> },
        ].map((stat) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
                <h2 className={`text-2xl font-bold ${stat.text}`}>{stat.value}</h2>
              </div>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Row */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid gap-4 md:grid-cols-3"
      >
        {/* Avg Resolution Time */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Rata-rata Penyelesaian</h3>
            <div className="text-4xl font-extrabold text-slate-800">{avgResolutionTime}</div>
            <p className="text-xs text-slate-400 mt-1">Jam per pengaduan</p>
          </div>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 md:col-span-2 p-6 relative overflow-hidden">
          <h3 className="text-sm font-semibold text-slate-500 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            Statistik Kinerja Mingguan
          </h3>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[40, 70, 50, 90, 60, 100].map((h, i) => (
              <div 
                key={i}
                className="bg-gradient-to-t from-blue-500 to-indigo-400 w-1/6 rounded-t-lg hover:from-blue-600 hover:to-indigo-500 transition-colors cursor-pointer relative group/bar" 
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-700 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-3 px-1">
            <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-800">Tabel Monitoring Pengaduan</h2>
          </div>
          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-50 shadow-none font-semibold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
            Live Sync
          </Badge>
        </div>
        <div className="p-6">
          <AdminComplaintTable complaints={complaints || []} isLoading={isLoading} />
        </div>
      </motion.div>
    </div>
  )
}
