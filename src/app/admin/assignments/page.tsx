"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useQuery as useAuthQuery } from "@tanstack/react-query"
import { authService } from "@/modules/auth/services/auth.service"
import { assignmentService } from "@/modules/admin/services/assignment.service"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { formatDistanceToNow, format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

import {
  UserCheck, Clock, MapPin, User, AlertTriangle,
  CheckCircle2, Loader2, ChevronRight, ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  EMERGENCY: { label: "Darurat", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  HIGH:      { label: "Tinggi",  color: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  MEDIUM:    { label: "Sedang",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  LOW:       { label: "Rendah",  color: "bg-green-100 text-green-700 border-green-200",  dot: "bg-green-500" },
}

export default function AdminAssignmentsPage() {
  const queryClient = useQueryClient()

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser(),
  })

  const { data: complaints, isLoading: loadingComplaints } = useQuery({
    queryKey: ['verified-complaints'],
    queryFn: () => assignmentService.getVerifiedComplaints(),
  })

  const { data: officers, isLoading: loadingOfficers } = useQuery({
    queryKey: ['available-officers'],
    queryFn: () => assignmentService.getAvailableOfficers(),
  })

  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null)
  const [selectedOfficer, setSelectedOfficer] = useState("")

  const assignMutate = useMutation({
    mutationFn: (data: any) => assignmentService.assignComplaint(data),
    onSuccess: () => {
      toast.success("Tugas berhasil diberikan ke petugas!")
      queryClient.invalidateQueries({ queryKey: ['verified-complaints'] })
      setSelectedComplaint(null)
      setSelectedOfficer("")
    },
    onError: (err: any) => toast.error("Gagal assign: " + err.message),
  })

  const handleAssign = () => {
    if (!selectedComplaint || !selectedOfficer || !user) return
    assignMutate.mutate({
      complaintId: selectedComplaint.id,
      officerId: selectedOfficer,
      assignedBy: user.id,
    })
  }

  const isSlaBreach = (deadline: string) =>
    deadline && new Date(deadline) < new Date()

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
            <UserCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assign Tugas Officer</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Distribusikan laporan yang telah diverifikasi ke petugas lapangan yang tepat.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-blue-700">
            {loadingComplaints ? "..." : complaints?.length || 0} Menunggu Assignment
          </span>
        </div>
      </motion.div>

      {/* Complaint Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        {loadingComplaints ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p>Memuat daftar laporan terverifikasi...</p>
          </div>
        ) : !complaints || complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Semua Laporan Sudah Ditugaskan</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Tidak ada laporan terverifikasi yang menunggu assignment saat ini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {complaints.map((c: any, i: number) => {
              const prio = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.LOW
              const breach = isSlaBreach(c.sla_deadline)
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-blue-200 transition-all duration-300 group"
                >
                  {/* Top Stripe */}
                  <div className={`h-1.5 w-full ${breach ? "bg-gradient-to-r from-red-500 to-rose-400" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`} />

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs font-semibold border ${prio.color} shadow-none`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${prio.dot}`} />
                          {prio.label}
                        </Badge>
                        {breach && (
                          <Badge variant="destructive" className="text-xs shadow-none bg-red-100 text-red-700 border border-red-200">
                            <ShieldAlert className="w-3 h-3 mr-1" /> SLA Breach
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-mono text-slate-400 shrink-0 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        {c.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-2">
                      {c.title}
                    </h3>

                    {/* Meta */}
                    <div className="space-y-1.5 text-sm text-slate-500 mt-auto">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {c.users?.full_name || "Anonim"}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{c.location}</span>
                      </div>
                      {c.sla_deadline && (
                        <div className={`flex items-center gap-2 font-medium text-xs px-2 py-1.5 rounded-lg ${breach ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {breach ? "Terlambat: " : "Sisa: "}
                          {formatDistanceToNow(new Date(c.sla_deadline), { locale: idLocale })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assign Button */}
                  <div className="px-5 pb-4">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 group-hover:shadow-md group-hover:shadow-blue-500/20 transition-all"
                      onClick={() => {
                        setSelectedComplaint(c)
                        setSelectedOfficer("")
                      }}
                    >
                      Pilih Petugas
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Assign Modal */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" /> Assign Petugas
            </DialogTitle>
            <DialogDescription>
              Pilih Officer yang akan menangani laporan ini. Statusnya akan otomatis berubah menjadi <strong>ASSIGNED</strong>.
            </DialogDescription>
          </DialogHeader>

          {/* Complaint Summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <p className="font-semibold text-slate-800 text-sm">{selectedComplaint?.title}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {selectedComplaint?.location}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              Pelapor: {selectedComplaint?.users?.full_name}
            </div>
          </div>

          {/* Officer Select */}
          <div className="space-y-2 pt-2">
            <Label className="font-semibold text-slate-700">Pilih Officer Lapangan</Label>
            {loadingOfficers ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar petugas...
              </div>
            ) : (
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="— Pilih Petugas —" />
                </SelectTrigger>
                <SelectContent>
                  {(officers || []).map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {o.full_name?.charAt(0)}
                        </div>
                        <div>
                          <span className="font-medium">{o.full_name}</span>
                          {o.phone_number && <span className="text-slate-400 text-xs ml-2">{o.phone_number}</span>}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setSelectedComplaint(null)} disabled={assignMutate.isPending}>
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAssign}
              disabled={!selectedOfficer || assignMutate.isPending}
            >
              {assignMutate.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                : <><CheckCircle2 className="w-4 h-4 mr-2" /> Konfirmasi Assign</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
