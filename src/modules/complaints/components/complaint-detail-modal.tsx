"use client"

import { useQuery, useMutation } from '@tanstack/react-query'
import { getComplaintDetailAction, deleteComplaintAction, submitRatingAndCloseAction } from '@/modules/complaints/actions/complaints.actions'
import { ratingService } from '@/modules/complaints/services/rating.service'
import { authService } from '@/modules/auth/services/auth.service'
import { EditComplaintForm } from '@/modules/complaints/components/edit-complaint-form'
import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { StarIcon } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { getStatusStyle, getPriorityStyle } from '@/utils/status-styles'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { MapPin, Calendar, AlertTriangle, User, Edit, Trash2, Image as ImageIcon, Clock } from 'lucide-react'
import { useQueryClient } from "@tanstack/react-query"



export function ComplaintDetailModal({
  complaintId,
  isOpen,
  onClose
}: {
  complaintId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  const { data: complaint, isLoading, error: complaintError } = useQuery({
    queryKey: ['complaint', complaintId],
    queryFn: () => getComplaintDetailAction(complaintId as string),
    enabled: !!complaintId && isOpen
  })

  const { data: rating } = useQuery({
    queryKey: ['rating', complaintId],
    queryFn: () => ratingService.getRating(complaintId as string),
    enabled: !!complaintId && complaint?.status === 'RESOLVED'
  })

  async function handleDelete() {
    if (!complaintId) return;
    if (!confirm('Apakah Anda yakin ingin menghapus laporan ini?')) return;
    try {
      await deleteComplaintAction(complaintId);
      toast.success('Laporan berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus laporan');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[860px] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-xl max-h-[90vh]">
        <DialogTitle className="sr-only">Detail Pengaduan</DialogTitle>
        {!complaint && !complaintError && isLoading ? (
          <div className="p-20 text-center text-slate-500 flex flex-col items-center justify-center min-h-[520px]">
             <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mb-4"></div>
             <p className="font-medium animate-pulse">Memuat detail pengaduan...</p>
          </div>
        ) : complaintError ? (
          <div className="p-16 text-center min-h-[520px] flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Laporan</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">{(complaintError as Error)?.message || 'Terjadi kesalahan sistem saat mengambil data.'}</p>
            <Button className="rounded-xl px-8" onClick={onClose}>Tutup Layar</Button>
          </div>
        ) : !complaint ? (
          <div className="p-16 text-center min-h-[520px] flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
               <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Laporan Tidak Ditemukan</h3>
            <p className="text-slate-500 mb-8">Laporan yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
            <Button className="rounded-xl px-8" onClick={onClose}>Kembali</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 min-h-[520px] h-full">
            {/* KIRI: Informasi Laporan */}
            <div className="md:col-span-3 bg-slate-50 p-6 sm:p-8 border-r border-slate-100 flex flex-col overflow-y-auto">
              <div className="flex items-center gap-2 mb-5">
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-md">
                  Laporan Anda
                </Badge>
                <span className="text-sm text-slate-400 font-medium">
                  {new Date(complaint.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                {complaint.is_escalated && (
                    <Badge variant="destructive" className="ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Area Eskalasi
                    </Badge>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-1 leading-snug">
                {complaint.title}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Dilaporkan oleh:{" "}
                <span className="font-semibold text-slate-700">
                  {complaint.users?.full_name || complaint.users?.email}
                </span>
              </p>

              <div className="space-y-5 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Lokasi Detail
                  </h4>
                  <p className="text-slate-700 text-sm font-medium bg-white p-3 rounded-xl border border-slate-200">
                    {complaint.location}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Deskripsi Masalah
                  </h4>
                  <p className="text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Foto Bukti
                  </h4>
                  {complaint.photo_url ? (
                    <img
                      src={complaint.photo_url}
                      alt="Bukti"
                      className="w-full max-h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x400/e2e8f0/64748b?text=Image+Not+Found';
                      }}
                    />
                  ) : (
                    <div className="h-28 w-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                      <span className="text-sm">Tidak ada foto dilampirkan</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* KANAN: Informasi Tambahan & Aksi */}
            <div className="md:col-span-2 bg-white p-6 sm:p-8 flex flex-col overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-4">
                   <div className="p-2 bg-slate-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-slate-600" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900">Rincian & Aksi</h3>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-6">
                 {/* Kategori */}
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                       Kategori Laporan
                    </h4>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700">
                       {complaint.complaint_categories?.name || '-'}
                    </div>
                 </div>

                 {/* Prioritas & Status */}
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                         Status
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getStatusStyle(complaint.status).className}`}>
                         {getStatusStyle(complaint.status).label}
                      </span>
                    </div>
                    {complaint.priority && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                           Prioritas
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getPriorityStyle(complaint.priority).className}`}>
                           {getPriorityStyle(complaint.priority).label}
                        </span>
                      </div>
                    )}
                 </div>

                 {/* Timeline / Rating */}
                 {complaint.status === 'RESOLVED' ? (
                    <RatingSection complaint={complaint} rating={rating} userId={user?.id || ''} />
                  ) : complaint.status === 'IN_PROGRESS' || complaint.status === 'ASSIGNED' ? (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Batas Waktu SLA</h4>
                      <SlaTimer deadline={complaint.sla_deadline} />
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Linimasa</h4>
                      <div className="py-4 flex flex-col items-center justify-center text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                         <Calendar className="w-5 h-5 text-slate-400 mb-2" />
                         <p className="text-xs font-medium text-slate-500 max-w-[180px]">Catatan penanganan akan tampil di sini saat diproses.</p>
                      </div>
                    </div>
                  )}
                 
                 {/* Aksi Bawah */}
                 {complaint.status === 'SUBMITTED' && (
                   <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                      <Button
                         type="button"
                         variant="outline"
                         className="flex-1 rounded-xl h-10 border-slate-200 text-slate-700 hover:bg-slate-50"
                         onClick={() => setIsEditDialogOpen(true)}
                      >
                         <Edit className="w-4 h-4 mr-1.5" />
                         Edit
                      </Button>
                      <Button
                         type="button"
                         className="flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-700"
                         onClick={handleDelete}
                      >
                         <Trash2 className="w-4 h-4 mr-1.5" />
                         Hapus
                      </Button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto z-[60]">
          <DialogHeader>
            <DialogTitle>Edit Pengaduan</DialogTitle>
            <DialogDescription>
              Perbarui detail pelaporan Anda di bawah ini. Anda hanya dapat mengedit jika status masih SUBMITTED.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {complaint && (
              <EditComplaintForm
                complaint={complaint}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['complaint', complaintId] });
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

// ─── Rating Section Component ────────────────────────────
function RatingSection({ complaint, rating, userId }: { complaint: any; rating: any; userId: string }) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(5);
  const [feedback, setFeedback] = useState('');

  const ratingMutation = useMutation({
    mutationFn: () => submitRatingAndCloseAction({
      complaintId: complaint.id,
      citizenId: userId,
      score,
      feedback,
    }),
    onSuccess: () => {
      toast.success("Terima kasih! Laporan Anda telah ditutup.")
      queryClient.invalidateQueries({ queryKey: ['complaint', complaint.id] })
      queryClient.invalidateQueries({ queryKey: ['rating', complaint.id] })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    },
    onError: (err: any) => toast.error(err.message || "Gagal mengirim rating")
  });

  // Already rated → show result
  if (rating) {
    return (
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🌟 Penilaian Anda</h4>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-md">
          <div className="flex gap-1 text-yellow-400 mb-2">
            {Array(rating.score).fill(0).map((_: any, i: number) => (
              <StarIcon key={i} className="w-5 h-5 fill-current" />
            ))}
            {Array(5 - rating.score).fill(0).map((_: any, i: number) => (
              <StarIcon key={`e-${i}`} className="w-5 h-5 text-slate-600" />
            ))}
          </div>
          {rating.feedback && <p className="text-sm text-slate-300 italic mt-1">&quot;{rating.feedback}&quot;</p>}
          <p className="text-xs text-slate-500 mt-3">Laporan telah selesai dan dinilai.</p>
        </div>
      </div>
    )
  }

  // RESOLVED but not yet rated → show form
  if (complaint.status === 'RESOLVED') {
    return (
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🌟 Berikan Penilaian</h4>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
          <p className="text-sm text-emerald-800 font-medium mb-3">
            Masalah Anda telah ditangani penyelesaiannya! Berikan rating mengenai tanggapan kami terhadap laporan ini.
          </p>
          {/* Star Rating */}
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                className={`p-0.5 rounded-full hover:scale-110 transition-transform ${
                  star <= score ? 'text-yellow-500' : 'text-slate-300'
                }`}
              >
                <StarIcon className="w-7 h-7 fill-current" />
              </button>
            ))}
          </div>
          {/* Feedback */}
          <Textarea
            placeholder="Tulis komentar tentang pelayanan (opsional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="text-sm bg-white border-emerald-200 focus-visible:ring-emerald-500 mb-3 rounded-lg"
            rows={2}
          />
          <Button
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
            onClick={() => ratingMutation.mutate()}
            disabled={ratingMutation.isPending}
          >
            {ratingMutation.isPending ? "Mengirim..." : `Kirim Penilaian Laporan`}
          </Button>
        </div>
      </div>
    )
  }

  // CLOSED without rating (edge case)
  return (
    <div>
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h4>
      <div className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-500">
        Laporan ini telah selesai namun tidak ada penilaian.
      </div>
    </div>
  )
}

// ─── SLA Timer Component ────────────────────────────
function SlaTimer({ deadline }: { deadline: string | null }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number, mins: number, secs: number, isOverdue: boolean } | null>(null);

  useEffect(() => {
    if (!deadline) return;
    
    const calculateTime = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, mins: 0, secs: 0, isOverdue: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, mins, secs, isOverdue: false });
      }
    };

    calculateTime(); // initial calculate
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return (
    <div className="py-3 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
      Batas waktu belum ditetapkan
    </div>
  );
  
  if (!timeLeft) return (
    <div className="py-4 text-center bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 animate-pulse">
      Menghitung sisa waktu...
    </div>
  );

  return (
    <div className={`py-4 flex flex-col items-center justify-center text-center rounded-xl border relative overflow-hidden ${timeLeft.isOverdue ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
       {timeLeft.isOverdue && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
       <Clock className={`w-6 h-6 mb-2 relative z-10 ${timeLeft.isOverdue ? 'text-red-500 animate-bounce' : 'text-blue-500'}`} />
       
       <div className={`text-2xl font-black tracking-tight relative z-10 tabular-nums ${timeLeft.isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
         {timeLeft.isOverdue ? 'KEDALUWARSA' : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.mins).padStart(2, '0')}:${String(timeLeft.secs).padStart(2, '0')}`}
       </div>
       
       <p className={`text-[11px] font-bold mt-1 uppercase tracking-wider relative z-10 ${timeLeft.isOverdue ? 'text-red-500' : 'text-blue-600/70'}`}>
         {timeLeft.isOverdue ? 'SLA Terlewati - Masuk Eskalasi' : 'Sisa Waktu Pengerjaan'}
       </p>
    </div>
  )
}
