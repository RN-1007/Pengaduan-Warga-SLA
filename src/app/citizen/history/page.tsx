"use client"

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth.service'
import { getComplaintsByCitizenAction } from '@/modules/complaints/actions/complaints.actions'
import { useRouter } from 'next/navigation'
import { PlusCircle, ClipboardList, MapPin, Calendar, ChevronRight, FileText } from 'lucide-react'
import { useState } from 'react'
import { ComplaintDetailModal } from '@/modules/complaints/components/complaint-detail-modal'
import { motion } from 'framer-motion'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateComplaintForm } from '@/modules/complaints/components/create-complaint-form'

import { FilterBar } from "@/components/ui/filter-bar"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { getStatusStyle } from '@/utils/status-styles'

export default function CitizenHistoryPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null)

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', user?.id],
    queryFn: () => getComplaintsByCitizenAction(user?.id as string),
    enabled: !!user?.id
  });

  const {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    filteredData
  } = useFilteredData({
    initialData: complaints,
    searchKeys: ['title', 'location', 'complaint_categories.name', 'status'],
  });

  if (!user) return <div className="p-8">Memuat riwayat...</div>

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Riwayat Pengaduan</h1>
            <p className="text-slate-500 text-sm mt-0.5">Daftar seluruh laporan yang pernah Anda buat</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          className="rounded-xl h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
        >
          <PlusCircle className="w-4 h-4 mr-2" /> Buat Pengaduan Baru
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="grid gap-4 md:grid-cols-4"
      >
        {[
          { label: 'Total Laporan', value: complaints?.length || 0, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
          { label: 'Sedang Diproses', value: complaints?.filter((c: any) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length || 0, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-700' },
          { label: 'Selesai', value: complaints?.filter((c: any) => c.status === 'RESOLVED' || c.status === 'CLOSED').length || 0, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          { label: 'Menunggu', value: complaints?.filter((c: any) => c.status === 'SUBMITTED' || c.status === 'VERIFIED').length || 0, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-20 h-20 ${stat.bg} rounded-full group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10">
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h2 className={`text-3xl font-bold ${stat.text}`}>{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter + Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-800">Daftar Pengaduan</h2>
        </div>
        
        <div className="p-6">
          <FilterBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortOption={sortOption}
            onSortChange={setSortOption}
            placeholder="Cari berdasarkan judul, lokasi, kategori, atau status..."
            totalFiltered={filteredData.length}
            totalItems={complaints?.length || 0}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-y border-slate-100">
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider pl-6">Judul Pengaduan</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Kategori</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Lokasi</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wider text-right pr-6">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin" />
                    <span>Mengambil data riwayat Anda...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredData.length ? (
              filteredData.map((c: any) => {
                const statusStyle = getStatusStyle(c.status)
                return (
                  <TableRow 
                    key={c.id} 
                    className="cursor-pointer hover:bg-blue-50/40 transition-colors group border-b border-slate-50 last:border-0"
                    onClick={() => setSelectedComplaintId(c.id)}
                  >
                    <TableCell className="font-medium text-slate-900 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors flex-shrink-0">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <span className="truncate max-w-[200px]">{c.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                        {c.complaint_categories?.name || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">{c.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2 text-slate-400 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="tabular-nums">
                          {new Date(c.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm">{searchQuery ? "Tidak ada laporan yang cocok dengan pencarian Anda." : "Belum ada laporan pengaduan yang Anda buat."}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Buat Pengaduan Baru</DialogTitle>
            <DialogDescription>
              Isi form di bawah dengan informasi sejelas mungkin.
            </DialogDescription>
          </DialogHeader>
          <CreateComplaintForm 
            citizenId={user.id} 
            onSuccess={() => setIsDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      <ComplaintDetailModal 
        complaintId={selectedComplaintId}
        isOpen={!!selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
      />
    </div>
  )
}
