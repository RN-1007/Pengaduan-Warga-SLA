"use client"

import { useQuery } from '@tanstack/react-query'
import { complaintsService } from '@/modules/complaints/services/complaints.service'
import { AdminComplaintTable } from '@/modules/complaints/components/admin-complaint-table'
import { authService } from '@/modules/auth/services/auth.service'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Clock, PlayCircle, CheckCircle2, ListFilter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: () => complaintsService.getAllComplaints()
  });

  const [greeting, setGreeting] = useState('Selamat Datang')
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 11) setGreeting('Selamat Pagi')
    else if (hour < 15) setGreeting('Selamat Siang')
    else if (hour < 19) setGreeting('Selamat Sore')
    else setGreeting('Selamat Malam')
  }, [])

  const submitted = complaints?.filter(c => c.status === 'SUBMITTED').length || 0;
  const inProgress = complaints?.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length || 0;
  const resolved = complaints?.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length || 0;
  
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 flex flex-col min-h-screen">
      
      {/* Header Profile section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold tracking-tighter shadow-inner">
             {user?.user_metadata?.full_name?.charAt(0) || 'A'}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{greeting}, {user?.user_metadata?.full_name || 'Administrator'}</h1>
            <p className="text-slate-500 text-sm mt-1">Pantau dan verifikasi laporan warga kota hari ini.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 border-slate-200" onClick={() => router.push('/admin/verification')}>
            <CheckCircle2 className="w-4 h-4 mr-2 text-slate-500" /> Verifikasi Laporan
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Metrics */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
           <div className="relative z-10">
             <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
               <Clock className="w-6 h-6" />
             </div>
             <p className="text-sm font-medium text-slate-500 mb-1">Menunggu Verifikasi</p>
             <div className="flex items-end gap-2">
               <h2 className="text-4xl font-bold text-slate-900">{submitted}</h2>
               <span className="text-sm text-yellow-600 font-medium mb-1">Laporan Baru</span>
             </div>
           </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
           <div className="relative z-10">
             <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
               <PlayCircle className="w-6 h-6" />
             </div>
             <p className="text-sm font-medium text-slate-500 mb-1">Sedang Ditangani</p>
             <div className="flex items-end gap-2">
               <h2 className="text-4xl font-bold text-slate-900">{inProgress}</h2>
               <span className="text-sm text-blue-600 font-medium mb-1">Proses Aktif</span>
             </div>
           </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
           <div className="relative z-10">
             <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
               <CheckCircle2 className="w-6 h-6" />
             </div>
             <p className="text-sm font-medium text-slate-500 mb-1">Masalah Tuntas</p>
             <div className="flex items-end gap-2">
               <h2 className="text-4xl font-bold text-slate-900">{resolved}</h2>
               <span className="text-sm text-green-600 font-medium mb-1">Terselesaikan</span>
             </div>
           </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
           <div className="relative z-10">
             <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
               <ListFilter className="w-6 h-6" />
             </div>
             <p className="text-sm font-medium text-slate-500 mb-1">Total Laporan Warga</p>
             <div className="flex items-end gap-2">
               <h2 className="text-4xl font-bold text-slate-900">{complaints?.length || 0}</h2>
               <span className="text-sm text-indigo-600 font-medium mb-1">Keseluruhan</span>
             </div>
           </div>
         </motion.div>
      </motion.div>

      {/* Main Table Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-slate-400" />
            <h2 className="text-xl font-semibold text-slate-800">Direktori Pengaduan Masuk</h2>
          </div>
        </div>
        <div className="p-6">
          <AdminComplaintTable complaints={complaints || []} isLoading={isLoading} />
        </div>
      </motion.div>
    </div>
  )
}
