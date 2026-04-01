"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedComplaintsAction, addComplaintUpdateAction } from '../actions/complaints.actions';
import { authService } from '@/modules/auth/services/auth.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin, Calendar, CheckCircle2, Loader2, FileText,
  Send, PlayCircle, User, Image as ImageIcon, AlertTriangle, X, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  EMERGENCY: { label: "🔴 Darurat",  color: "bg-red-100 text-red-700 border-red-200" },
  HIGH:      { label: "🟠 Tinggi",   color: "bg-orange-100 text-orange-700 border-orange-200" },
  MEDIUM:    { label: "🟡 Sedang",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  LOW:       { label: "🟢 Rendah",   color: "bg-green-100 text-green-700 border-green-200" },
};

// ─── Tipe modal ───────────────────────────────────────────────────────────────
type ModalMode = "detail" | "progress";

export function OfficerUpdatesBoard() {
  const queryClient = useQueryClient();

  // Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [modalMode, setModalMode] = useState<ModalMode>("detail");

  // Progress form state
  const [updateNotes, setUpdateNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("RESOLVED");

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['assigned-complaints'],
    queryFn: () => getAssignedComplaintsAction()
  });

  // ─── Mutation: Terima Tugas (ASSIGNED → IN_PROGRESS) ──────────────────────
  const acceptMutation = useMutation({
    mutationFn: async (complaintId: string) => {
      if (!user) throw new Error("Unauthenticated");
      return addComplaintUpdateAction({
        complaintId,
        officerId: user.id,
        status: 'IN_PROGRESS',
        notes: '[DITERIMA] Petugas telah menerima dan memulai penanganan laporan.'
      });
    },
    onSuccess: () => {
      toast.success("Tugas berhasil diterima! Status berubah ke Sedang Diproses.");
      queryClient.invalidateQueries({ queryKey: ['assigned-complaints'] });
      // Langsung buka mode progress setelah terima tugas
      setModalMode("progress");
      setTargetStatus("RESOLVED");
      setUpdateNotes("");
    },
    onError: (err: any) => toast.error("Gagal menerima tugas: " + err.message)
  });

  // ─── Mutation: Kirim Update Progress (IN_PROGRESS → RESOLVED) ─────────────
  const updateMutation = useMutation({
    mutationFn: async (payload: { complaintId: string; status: string; notes: string }) => {
      if (!user) throw new Error("Unauthenticated");
      return addComplaintUpdateAction({
        complaintId: payload.complaintId,
        officerId: user.id,
        status: payload.status,
        notes: payload.notes
      });
    },
    onSuccess: () => {
      toast.success("Progress berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ['assigned-complaints'] });
      closeModal();
    },
    onError: (err: any) => toast.error(err.message || "Gagal memperbarui progress")
  });

  const openModal = (complaint: any) => {
    setSelectedComplaint(complaint);
    // Jika sudah IN_PROGRESS, langsung ke form progress
    setModalMode(complaint.status === 'IN_PROGRESS' ? "progress" : "detail");
    setUpdateNotes("");
    setTargetStatus("RESOLVED");
  };

  const closeModal = () => {
    setSelectedComplaint(null);
    setModalMode("detail");
    setUpdateNotes("");
  };

  const handleSubmitProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!updateNotes.trim()) {
      toast.error("Catatan progress tidak boleh kosong");
      return;
    }
    updateMutation.mutate({
      complaintId: selectedComplaint.id,
      status: targetStatus,
      notes: updateNotes
    });
  };

  // ─── Animasi ──────────────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full relative min-h-[500px]">

      {/* ── Daftar Kartu Tugas ── */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : complaints?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4 opacity-50" />
          <p className="text-lg font-medium text-slate-700">Tidak ada tugas aktif.</p>
          <p className="text-sm">Semua pengaduan sudah diselesaikan!</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {complaints?.map((complaint: any) => {
            const prio = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG.LOW;
            const isAssigned = complaint.status === 'ASSIGNED';
            return (
              <motion.div
                key={complaint.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
              >
                {/* Status stripe di atas */}
                <div className={`h-1.5 w-full ${isAssigned
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                />

                <div className="p-5 flex-1 flex flex-col gap-3">
                  {/* Badge baris atas */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      className={`text-xs font-semibold border shadow-none ${isAssigned
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'}`}
                    >
                      {isAssigned ? '⏳ Menunggu Diterima' : '🔄 Sedang Diproses'}
                    </Badge>
                    <Badge className={`text-xs font-semibold border shadow-none ${prio.color}`}>
                      {prio.label}
                    </Badge>
                  </div>

                  {/* Judul */}
                  <h3 className="text-base font-bold text-slate-800 line-clamp-2 leading-tight">
                    {complaint.title}
                  </h3>

                  {/* Deskripsi singkat */}
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {complaint.description}
                  </p>

                  {/* Meta info */}
                  <div className="space-y-1.5 mt-auto pt-3 border-t border-slate-100">
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-400 shrink-0" />
                      <span className="truncate">{complaint.location}</span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400 shrink-0" />
                      <span>{new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-5 pb-4">
                  <Button
                    className={`w-full rounded-xl h-10 text-sm font-semibold transition-all ${isAssigned
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'}`}
                    onClick={() => openModal(complaint)}
                  >
                    {isAssigned ? (
                      <><ClipboardCheck className="w-4 h-4 mr-2" /> Lihat & Terima Tugas</>
                    ) : (
                      <><PlayCircle className="w-4 h-4 mr-2" /> Update Progress</>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
            >
              {/* ─── SPLIT: Kiri Detail, Kanan Aksi ─── */}
              <div className="grid grid-cols-1 md:grid-cols-5 min-h-[480px]">

                {/* ── KIRI: Detail Laporan (read-only) ── */}
                <div className="md:col-span-3 bg-slate-50 p-6 border-r border-slate-100 flex flex-col overflow-y-auto max-h-[85vh]">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={`text-xs font-semibold border shadow-none ${
                      selectedComplaint.status === 'ASSIGNED'
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                      {selectedComplaint.status === 'ASSIGNED' ? '⏳ Perlu Diterima' : '🔄 Sedang Diproses'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedComplaint.id.substring(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
                    {selectedComplaint.title}
                  </h2>

                  {selectedComplaint.users?.full_name && (
                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Dilaporkan oleh: <span className="font-semibold text-slate-700">{selectedComplaint.users.full_name}</span>
                    </p>
                  )}

                  <div className="space-y-4 flex-1">
                    {/* Lokasi */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Lokasi
                      </h4>
                      <p className="text-sm text-slate-700 font-medium bg-white p-3 rounded-xl border border-slate-200">
                        {selectedComplaint.location}
                      </p>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Deskripsi Masalah
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {selectedComplaint.description}
                      </p>
                    </div>

                    {/* Kategori & Prioritas */}
                    <div className="flex gap-2 flex-wrap">
                      {selectedComplaint.complaint_categories?.name && (
                        <Badge variant="outline" className="text-slate-600 bg-white border-slate-200 font-normal text-xs">
                          {selectedComplaint.complaint_categories.name}
                        </Badge>
                      )}
                      {selectedComplaint.priority && (
                        <Badge className={`text-xs font-semibold border shadow-none ${(PRIORITY_CONFIG[selectedComplaint.priority] || PRIORITY_CONFIG.LOW).color}`}>
                          {(PRIORITY_CONFIG[selectedComplaint.priority] || PRIORITY_CONFIG.LOW).label}
                        </Badge>
                      )}
                    </div>

                    {/* Foto Bukti */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" /> Foto Bukti
                      </h4>
                      {selectedComplaint.photo_url ? (
                        <img
                          src={selectedComplaint.photo_url}
                          alt="Bukti laporan"
                          className="w-full max-h-40 object-cover rounded-xl border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-20 w-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                          Tidak ada foto dilampirkan
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── KANAN: Panel Aksi ── */}
                <div className="md:col-span-2 bg-white p-6 flex flex-col">
                  {/* Close button */}
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* ── MODE DETAIL: Terima Tugas ── */}
                  {modalMode === "detail" && (
                    <div className="flex flex-col flex-1">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-amber-50 rounded-lg">
                            <ClipboardCheck className="w-4 h-4 text-amber-600" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">Terima Tugas</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Konfirmasi bahwa Anda siap menangani laporan ini. Status akan berubah menjadi <strong>Sedang Diproses</strong>.
                        </p>
                      </div>

                      {/* Info SLA */}
                      {selectedComplaint.sla_deadline && (
                        <div className={`p-3 rounded-xl border mb-5 text-sm ${
                          new Date(selectedComplaint.sla_deadline) < new Date()
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          <p className="font-semibold text-xs uppercase tracking-wide mb-0.5 opacity-70">
                            {new Date(selectedComplaint.sla_deadline) < new Date() ? '⚠️ SLA Breach' : '⏱ Batas Waktu SLA'}
                          </p>
                          <p className="font-bold">
                            {new Date(selectedComplaint.sla_deadline).toLocaleString('id-ID', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}

                      <div className="mt-auto space-y-3">
                        <Button
                          className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-sm shadow-amber-500/20"
                          disabled={acceptMutation.isPending}
                          onClick={() => acceptMutation.mutate(selectedComplaint.id)}
                        >
                          {acceptMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                          )}
                          Terima & Mulai Kerjakan
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full h-11 rounded-xl border-slate-200 text-slate-600"
                          onClick={closeModal}
                          disabled={acceptMutation.isPending}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* ── MODE PROGRESS: Update / Selesaikan ── */}
                  {modalMode === "progress" && (
                    <div className="flex flex-col flex-1">
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800">Update Progress</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Catat perkembangan terkini dan tandai laporan jika sudah selesai.
                        </p>
                      </div>

                      <form onSubmit={handleSubmitProgress} className="flex flex-col flex-1 gap-4">
                        {/* Status Target */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Status Target
                          </label>
                          <div className="flex gap-2">
                            {(['IN_PROGRESS', 'RESOLVED'] as const).map(s => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setTargetStatus(s)}
                                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                                  targetStatus === s
                                    ? s === 'RESOLVED'
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500/20'
                                      : 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500/20'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {s === 'IN_PROGRESS' ? '🔄 Update' : '✅ Selesai'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Catatan */}
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Catatan Progress
                          </label>
                          <textarea
                            value={updateNotes}
                            onChange={(e) => setUpdateNotes(e.target.value)}
                            placeholder={targetStatus === 'RESOLVED'
                              ? "Contoh: Perbaikan telah selesai dilakukan, lokasi sudah bersih."
                              : "Contoh: Tim sedang meluncur ke lokasi untuk penanganan."
                            }
                            className="w-full h-32 p-3 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-all placeholder:text-slate-400"
                            required
                          />
                        </div>

                        {/* Tombol Aksi */}
                        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-10 text-slate-600 border-slate-200"
                            onClick={() => {
                              // Jika tadinya ASSIGNED dan sudah diterima, tutup saja
                              closeModal();
                            }}
                            disabled={updateMutation.isPending}
                          >
                            Tutup
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateMutation.isPending}
                            className={`flex-1 rounded-xl h-10 font-semibold text-white ${
                              targetStatus === 'RESOLVED'
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20'
                            }`}
                          >
                            {updateMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                            ) : (
                              <Send className="w-4 h-4 mr-1.5" />
                            )}
                            {targetStatus === 'RESOLVED' ? 'Selesaikan' : 'Kirim Update'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
