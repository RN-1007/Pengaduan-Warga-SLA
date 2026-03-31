"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { slaService } from "@/modules/admin/services/sla.service"
import { toast } from "sonner"
import { motion } from "framer-motion"

import {
  Timer, Plus, Trash2, Loader2, Clock, AlertTriangle
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
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"

const PRIORITY_META: Record<string, { label: string; color: string; hours: number }> = {
  EMERGENCY: { label: "🔴 Darurat",  color: "bg-red-100 text-red-700 border-red-200",     hours: 6  },
  HIGH:      { label: "🟠 Tinggi",   color: "bg-orange-100 text-orange-700 border-orange-200", hours: 24 },
  MEDIUM:    { label: "🟡 Sedang",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", hours: 48 },
  LOW:       { label: "🟢 Rendah",   color: "bg-green-100 text-green-700 border-green-200",  hours: 72 },
}

export default function AdminSlaPage() {
  const queryClient = useQueryClient()

  const { data: slaRules, isLoading } = useQuery({
    queryKey: ['sla-rules'],
    queryFn: () => slaService.getSlaRules(),
  })

  const { data: categories } = useQuery({
    queryKey: ['active-categories'],
    queryFn: () => slaService.getActiveCategories(),
  })

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formCategoryId, setFormCategoryId] = useState("")
  const [formPriority, setFormPriority] = useState("")
  const [formHours, setFormHours] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  const upsertMutate = useMutation({
    mutationFn: () => slaService.upsertSlaRule({
      categoryId: formCategoryId,
      priority: formPriority,
      resolutionTimeHours: Number(formHours),
    }),
    onSuccess: () => {
      toast.success("Aturan SLA berhasil disimpan!")
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] })
      setShowForm(false)
      setFormCategoryId(""); setFormPriority(""); setFormHours("")
    },
    onError: (err: any) => toast.error("Gagal menyimpan: " + err.message),
  })

  const deleteMutate = useMutation({
    mutationFn: (id: string) => slaService.deleteSlaRule(id),
    onSuccess: () => {
      toast.success("Aturan SLA dihapus")
      queryClient.invalidateQueries({ queryKey: ['sla-rules'] })
      setDeleteTarget(null)
    },
    onError: (err: any) => toast.error("Gagal hapus: " + err.message),
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryId || !formPriority || !formHours) return
    upsertMutate.mutate()
  }

  const prefillHours = (priority: string) => {
    setFormPriority(priority)
    if (!formHours) setFormHours(String(PRIORITY_META[priority]?.hours || ""))
  }

  // Summary cards
  const totalRules = slaRules?.length || 0
  const avgHours = totalRules > 0
    ? Math.round((slaRules || []).reduce((s: number, r: any) => s + (r.resolution_time_hours || 0), 0) / totalRules)
    : 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 mb-2"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
            <Timer className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola SLA</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Atur batas waktu penyelesaian berdasarkan kategori dan tingkat prioritas.
            </p>
          </div>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Aturan SLA
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Object.entries(PRIORITY_META).map(([key, meta]) => {
          const count = (slaRules || []).filter((r: any) => r.priority === key).length
          return (
            <div key={key} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10 bg-current" />
              <p className="text-xs font-semibold text-slate-500 mb-1">{meta.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-slate-800">{count}</p>
                <p className="text-xs text-slate-400 mb-1">aturan</p>
              </div>
              <p className="text-xs text-slate-400 mt-1">Default: {meta.hours} jam</p>
            </div>
          )
        })}
      </motion.div>

      {/* SLA Rules Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Daftar Aturan SLA</h2>
            <p className="text-sm text-slate-500 mt-0.5">Total {totalRules} aturan aktif • Rata-rata {avgHours} jam</p>
          </div>
          {isLoading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
        </div>

        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="pl-6">Kategori</TableHead>
              <TableHead>Prioritas</TableHead>
              <TableHead>Batas Waktu</TableHead>
              <TableHead>Setara</TableHead>
              <TableHead className="text-right pr-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    Memuat aturan SLA...
                  </div>
                </TableCell>
              </TableRow>
            ) : !slaRules || slaRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-slate-300" />
                    <p>Belum ada aturan SLA. Tambahkan aturan pertama Anda.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (slaRules || []).map((rule: any) => {
                const meta = PRIORITY_META[rule.priority]
                const days = rule.resolution_time_hours >= 24
                  ? `${Math.round(rule.resolution_time_hours / 24)} hari`
                  : `${rule.resolution_time_hours} jam`
                return (
                  <TableRow key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="pl-6 font-medium text-slate-800">
                      {rule.complaint_categories?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-semibold border shadow-none ${meta?.color || "bg-slate-100 text-slate-600"}`}>
                        {meta?.label || rule.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {rule.resolution_time_hours} Jam
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">{days}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(rule)}
                        disabled={deleteMutate.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add SLA Rule Modal */}
      <Dialog open={showForm} onOpenChange={(open) => !open && setShowForm(false)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" /> Tambah Aturan SLA
            </DialogTitle>
            <DialogDescription>
              Tentukan batas waktu penyelesaian untuk kombinasi kategori dan prioritas. Aturan yang sudah ada akan diperbarui otomatis.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Kategori Laporan</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="— Pilih Kategori —" />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Tingkat Prioritas</Label>
              <Select value={formPriority} onValueChange={prefillHours} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="— Pilih Prioritas —" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_META).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-slate-400 text-xs ml-2">(Default: {meta.hours} jam)</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Batas Waktu (Jam)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="number"
                  min={1}
                  max={720}
                  placeholder="Misal: 24"
                  className="pl-10 h-11"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  required
                />
              </div>
              {formHours && Number(formHours) >= 24 && (
                <p className="text-xs text-slate-400">
                  ≈ {Math.round(Number(formHours) / 24)} hari
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={upsertMutate.isPending}>
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!formCategoryId || !formPriority || !formHours || upsertMutate.isPending}
              >
                {upsertMutate.isPending
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  : <><Plus className="w-4 h-4 mr-2" /> Simpan Aturan</>
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Hapus Aturan SLA
            </DialogTitle>
            <DialogDescription>
              Anda akan menghapus aturan SLA untuk kategori{" "}
              <strong>{deleteTarget?.complaint_categories?.name}</strong> dengan prioritas{" "}
              <strong>{PRIORITY_META[deleteTarget?.priority]?.label || deleteTarget?.priority}</strong>.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutate.isPending}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutate.mutate(deleteTarget.id)}
              disabled={deleteMutate.isPending}
            >
              {deleteMutate.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus...</>
                : <><Trash2 className="w-4 h-4 mr-2" /> Ya, Hapus</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
