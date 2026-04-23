"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getEscalatedComplaintsAction, 
  getAllOfficersAction, 
  reassignOfficerAction, 
  forceResolveAction, 
  deescalateAction 
} from '../actions/escalations.actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCcw, 
  ShieldOff,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FilterBar } from "@/components/ui/filter-bar"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { Button } from '@/components/ui/button'
import { formatDistanceToNow, isPast } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EscalationBoard({ currentUserId }: { currentUserId: string }) {
  const queryClient = useQueryClient()
  
  // Modals state
  const [reassignData, setReassignData] = useState<any | null>(null)
  const [resolveData, setResolveData] = useState<any | null>(null)
  const [deescalateData, setDeescalateData] = useState<any | null>(null)

  // Forms state
  const [notes, setNotes] = useState("")
  const [selectedOfficer, setSelectedOfficer] = useState("")

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['escalated-complaints'],
    queryFn: () => getEscalatedComplaintsAction()
  })

  const {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    filteredData
  } = useFilteredData({
    initialData: complaints,
    searchKeys: ['title', 'location', 'users.full_name', 'id'],
  })

  const { data: officers } = useQuery({
    queryKey: ['available-officers'],
    queryFn: () => getAllOfficersAction(),
    enabled: !!reassignData // Hanya load jika modal reassign terbuka
  })

  // Mutations
  const reassignMutate = useMutation({
    mutationFn: (data: { complaintId: string, officerId: string, notes: string }) => 
      reassignOfficerAction({ ...data, supervisorId: currentUserId }),
    onSuccess: () => {
      toast.success("Tugas berhasil dipindahtangankan")
      queryClient.invalidateQueries({ queryKey: ['escalated-complaints'] })
      closeModals()
    },
    onError: (err: any) => toast.error(err.message)
  })

  const resolveMutate = useMutation({
    mutationFn: (data: { complaintId: string, notes: string }) => 
      forceResolveAction({ ...data, supervisorId: currentUserId }),
    onSuccess: () => {
      toast.success("Laporan ditutup paksa")
      queryClient.invalidateQueries({ queryKey: ['escalated-complaints'] })
      closeModals()
    },
    onError: (err: any) => toast.error(err.message)
  })

  const deescalateMutate = useMutation({
    mutationFn: (data: { complaintId: string, notes: string }) => 
      deescalateAction({ ...data, supervisorId: currentUserId }),
    onSuccess: () => {
      toast.success("Status eskalasi dicabut")
      queryClient.invalidateQueries({ queryKey: ['escalated-complaints'] })
      closeModals()
    },
    onError: (err: any) => toast.error(err.message)
  })

  const closeModals = () => {
    setReassignData(null)
    setResolveData(null)
    setDeescalateData(null)
    setNotes("")
    setSelectedOfficer("")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } as const }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p>Memuat daftar urgensi tingkat tinggi...</p>
      </div>
    )
  }

  if (!complaints || complaints.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-12 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">SLA Aman & Terkendali</h3>
        <p className="text-slate-500 mt-2 max-w-md">Luar biasa! Tidak ada laporan yang melebihi batas Service Level Agreement atau masuk dalam daftar eskalasi saat ini.</p>
      </motion.div>
    )
  }

  return (
    <>
      <FilterBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        placeholder="Cari berdasarkan ID, nama pelapor, judul..."
        totalFiltered={filteredData.length}
        totalItems={complaints?.length || 0}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {filteredData.length === 0 ? (
             <div className="col-span-full py-12 text-center text-slate-500">
               {searchQuery ? "Tidak ada eskalasi yang cocok dengan pencarian." : "Belum ada eskalasi."}
             </div>
          ) : (
            filteredData.map((c: any) => {
              const isLate = c.sla_deadline ? isPast(new Date(c.sla_deadline)) : false;
            
            return (
              <motion.div 
                key={c.id}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300"
              >
                {/* Header Tape */}
                <div className="h-2 bg-gradient-to-r from-red-500 to-orange-500"></div>
                
                <div className="p-5 flex-1 flex flex-col">
                  {/* Meta */}
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none">
                      <ShieldAlert className="w-3 h-3 mr-1" /> Eskalasi SLA
                    </Badge>
                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      ID: {c.id.substring(0,6).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight">
                    {c.title}
                  </h3>
                  
                  <div className="space-y-2 mt-auto pt-4 text-sm">
                    <div className="flex items-center text-slate-600">
                      <User className="w-4 h-4 mr-2 text-slate-400" />
                      Pelapor: <span className="font-medium ml-1">{c.users?.full_name}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      <span className="truncate">{c.location}</span>
                    </div>
                    
                    {c.sla_deadline && (
                      <div className={`flex items-center p-2 rounded-lg mt-3 ${isLate ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="font-medium text-xs">
                          {isLate ? 'Telah Lewat: ' : 'Sisa Waktu: '}
                          {formatDistanceToNow(new Date(c.sla_deadline), { locale: id })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supervisor Interventions */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="col-span-1 bg-white hover:bg-slate-100 text-xs font-medium text-slate-600 h-9"
                    onClick={() => setDeescalateData(c)}
                  >
                    <ShieldOff className="w-3.5 h-3.5 mr-1.5" /> Normal
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="col-span-1 bg-white hover:bg-blue-50 hover:text-blue-700 border-blue-100 text-blue-600 text-xs font-medium h-9"
                    onClick={() => setReassignData(c)}
                  >
                    <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Alihkan
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="col-span-1 text-xs font-medium h-9 shadow-md shadow-red-500/20"
                    onClick={() => setResolveData(c)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Tutup
                  </Button>
                </div>
              </motion.div>
            )
          }))}
        </AnimatePresence>
      </motion.div>

      {/* REASSIGN MODAL */}
      <Dialog open={!!reassignData} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alihkan Tugas (Reassign)</DialogTitle>
            <DialogDescription>
              Tarik laporan <strong>{reassignData?.title}</strong> dari daftar tugas sebelumnya dan berikan ke Petugas baru agar segera ditangani. 
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Pilih Petugas Baru</Label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Officer dari daftar..." />
                </SelectTrigger>
                <SelectContent>
                  {officers?.map(off => (
                    <SelectItem key={off.id} value={off.id}>
                      {off.full_name} ({off.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Catatan Eskalasi (Wajib)</Label>
              <Textarea 
                placeholder="Berikan instruksi mengapa laporan ini dialihkan..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={reassignMutate.isPending}>Batal</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => reassignData && reassignMutate.mutate({ complaintId: reassignData.id, officerId: selectedOfficer, notes })}
              disabled={!selectedOfficer || !notes || reassignMutate.isPending}
            >
              {reassignMutate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Konfirmasi Pemindahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FORCE RESOLVE MODAL */}
      <Dialog open={!!resolveData} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Selesaikan Paksa (Force Resolve)</DialogTitle>
            <DialogDescription>
              Anda akan mengambil alih otoritas <strong>{resolveData?.title}</strong> dan menyatakannya sebagai SELESAI tanpa menunggu laporan kerja petugas lapangan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Berita Acara / Alasan Keputusan (Wajib)</Label>
              <Textarea 
                placeholder="Contoh: Tim pihak ketiga sudah mengonfirmasi jalan selesai diperbaiki kemarin..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={resolveMutate.isPending}>Batal</Button>
            <Button 
              variant="destructive"
              onClick={() => resolveData && resolveMutate.mutate({ complaintId: resolveData.id, notes })}
              disabled={!notes || resolveMutate.isPending}
            >
              {resolveMutate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Tutup Kasus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DE-ESCALATE MODAL */}
      <Dialog open={!!deescalateData} onOpenChange={(open) => !open && closeModals()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cabut Eskalasi (De-escalate)</DialogTitle>
            <DialogDescription>
              Menghapus status 'Darurat/Eskalasi' dari laporan <strong>{deescalateData?.title}</strong>. Laporan ini akan kembali menjadi tugas 'In Progress' biasa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Catatan Pencabutan (Wajib)</Label>
              <Textarea 
                placeholder="Berikan alasan mengapa status urgensi laporan ini diturunkan..." 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModals} disabled={deescalateMutate.isPending}>Batal</Button>
            <Button 
              onClick={() => deescalateData && deescalateMutate.mutate({ complaintId: deescalateData.id, notes })}
              disabled={!notes || deescalateMutate.isPending}
            >
              {deescalateMutate.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Terapkan Normalisasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
