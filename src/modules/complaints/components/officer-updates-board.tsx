"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssignedComplaintsAction, addComplaintUpdateAction } from '../actions/complaints.actions';
import { authService } from '@/modules/auth/services/auth.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, CheckCircle2, ChevronRight, Loader2, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

export function OfficerUpdatesBoard() {
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [updateNotes, setUpdateNotes] = useState("");
  const [targetStatus, setTargetStatus] = useState("IN_PROGRESS");

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['assigned-complaints'],
    queryFn: () => getAssignedComplaintsAction()
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { complaintId: string, status: string, notes: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['all-complaints'] });
      setSelectedComplaint(null);
      setUpdateNotes("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Gagal memperbarui progress");
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full relative min-h-[500px]">
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
          {complaints?.map((complaint: any) => (
            <motion.div 
              key={complaint.id}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-2xl p-6 overflow-hidden cursor-pointer transition-all duration-300"
              onClick={() => {
                setSelectedComplaint(complaint);
                setTargetStatus(complaint.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'RESOLVED');
                setUpdateNotes("");
              }}
            >
              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <Badge variant={complaint.status === 'ASSIGNED' ? 'secondary' : 'default'} className="px-3 py-1 shadow-sm font-semibold tracking-wide">
                   {complaint.status}
                </Badge>
                {complaint.priority && (
                  <Badge variant={complaint.priority === 'EMERGENCY' ? 'destructive' : 'outline'} className="text-[10px] tracking-wider uppercase font-bold">
                     {complaint.priority}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-2 relative z-10 leading-tight">
                {complaint.title}
              </h3>
              
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 relative z-10 leading-relaxed">
                {complaint.description}
              </p>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 relative z-10">
                <div className="flex items-center text-xs text-slate-500 font-medium">
                   <MapPin className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                   <span className="truncate">{complaint.location}</span>
                </div>
                <div className="flex items-center text-xs text-slate-500 font-medium">
                   <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                   <span>{new Date(complaint.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300 z-10">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modal for updating progress */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 px-4 sm:px-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedComplaint(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
               <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-white">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Update Progress</h2>
                      <p className="text-sm text-slate-500 line-clamp-1" title={selectedComplaint.title}>
                        {selectedComplaint.title}
                      </p>
                    </div>
                 </div>

                 <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status Target</label>
                      <div className="flex gap-3">
                        {['IN_PROGRESS', 'RESOLVED'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setTargetStatus(status)}
                            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                              targetStatus === status 
                                ? 'bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-600/10 shadow-sm' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            {status === 'IN_PROGRESS' ? 'Sedang Diproses' : 'Selesai'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan Progress</label>
                      <textarea 
                        value={updateNotes}
                        onChange={(e) => setUpdateNotes(e.target.value)}
                        placeholder="Contoh: Tim sedang meluncur ke lokasi untuk perbaikan / Perbaikan telah selesai dilakukan..."
                        className="w-full min-h-[120px] p-4 text-sm rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none shadow-sm placeholder:text-slate-400"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 rounded-xl h-12 text-slate-600 border-slate-200 hover:bg-slate-50"
                        onClick={() => setSelectedComplaint(null)}
                      >
                        Batal
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={updateMutation.isPending}
                        className="flex-1 rounded-xl h-12 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white font-semibold"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" /> Kirim Update
                          </>
                        )}
                      </Button>
                    </div>
                 </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
