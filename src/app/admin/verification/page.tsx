// File: src/app/admin/verification/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { authService } from "@/modules/auth/services/auth.service";
import { getActiveCategoriesAction } from "@/modules/complaints/actions/complaints.actions";
import { verificationService } from "@/modules/admin/services/verification.service";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, MapPin, AlertTriangle, Image as ImageIcon, Loader2 } from "lucide-react";

export default function VerificationPage() {
    const queryClient = useQueryClient();

    // ─── Data Fetching (mengganti mock data) ───
    const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => authService.getCurrentUser() });
    const { data: pendingComplaints, isLoading } = useQuery({ queryKey: ['pending-complaints'], queryFn: () => verificationService.getPendingComplaints() });
    const { data: categories } = useQuery({ queryKey: ['active-categories'], queryFn: () => getActiveCategoriesAction() });

    // ─── Form State (per-baris modal) ───
    const [activePriority, setActivePriority] = useState<Record<string, string>>({});
    const [activeCategoryId, setActiveCategoryId] = useState<Record<string, string>>({});
    const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

    // ─── Mutations ───
    const verifyMutate = useMutation({
        mutationFn: (data: any) => verificationService.verifyComplaint(data),
        onSuccess: () => {
            toast.success("Laporan berhasil diverifikasi! SLA telah aktif.");
            queryClient.invalidateQueries({ queryKey: ['pending-complaints'] });
        },
        onError: (err: any) => toast.error("Gagal: " + err.message)
    });

    const rejectMutate = useMutation({
        mutationFn: (data: any) => verificationService.rejectComplaint(data),
        onSuccess: () => {
            toast.success("Laporan telah ditolak.");
            queryClient.invalidateQueries({ queryKey: ['pending-complaints'] });
        },
        onError: (err: any) => toast.error("Gagal: " + err.message)
    });

    // Gunakan data DB, fallback ke array kosong
    const mockPendingComplaints = (pendingComplaints || []).map((c: any) => ({
        id: c.id,
        citizenName: c.users?.full_name || '-',
        title: c.title,
        category: c.complaint_categories?.name || 'Lainnya',
        location: c.location,
        description: c.description,
        photo_url: c.photo_url,
        category_id: c.category_id,
        date: format(new Date(c.created_at), 'dd MMM yyyy', { locale: idLocale }),
        status: c.status
    }));

    return (
        <div className="space-y-6 max-w-[1200px] mx-auto">
            {/* Header Halaman */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verifikasi Laporan</h1>
                <p className="text-slate-500 mt-1">Tinjau, tentukan prioritas, dan teruskan laporan warga ke petugas lapangan.</p>
            </div>

            {/* Tabel Data Laporan Pending */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Antrean Verifikasi</CardTitle>
                            <CardDescription>Ada {isLoading ? '...' : mockPendingComplaints.length} laporan yang menunggu tindakan Anda.</CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Clock className="w-3 h-3 mr-1" /> Menunggu Review
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[100px] pl-6">ID</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Pelapor</TableHead>
                                <TableHead>Judul Laporan</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-48 text-center text-slate-500"><div className="flex justify-center items-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Memuat laporan...</div></TableCell></TableRow>
                            ) : mockPendingComplaints.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-48 text-center text-slate-500">Tidak ada laporan baru. Semua sudah terverifikasi!</TableCell></TableRow>
                            ) : mockPendingComplaints.map((complaint: typeof mockPendingComplaints[0]) => (
                                <TableRow key={complaint.id} className="hover:bg-slate-50/80 transition-colors">
                                    <TableCell className="font-medium text-slate-600 pl-6 font-mono text-xs uppercase">{complaint.id.substring(0, 8)}</TableCell>
                                    <TableCell className="text-slate-600">{complaint.date}</TableCell>
                                    <TableCell>{complaint.citizenName}</TableCell>
                                    <TableCell className="max-w-[250px] truncate font-medium text-slate-900">
                                        {complaint.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-slate-600 font-normal">
                                            {complaint.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center pr-6">

                                        {/* ==== MODAL VERIFIKASI (SPLIT VIEW) ==== */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                                                    Tinjau Laporan
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden rounded-2xl">

                                                <div className="grid grid-cols-1 md:grid-cols-5 h-full">

                                                    {/* SISI KIRI: Informasi Laporan (Read-Only) */}
                                                    <div className="md:col-span-3 bg-slate-50 p-6 sm:p-8 border-r border-slate-100">
                                                        <div className="flex items-center gap-2 mb-6">
                                                            <Badge className="bg-amber-500 hover:bg-amber-600">Laporan Baru</Badge>
                                                            <span className="text-sm text-slate-500 font-medium">{complaint.date}</span>
                                                        </div>

                                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{complaint.title}</h2>
                                                        <p className="text-sm text-slate-500 mb-6">Dilaporkan oleh: <span className="font-semibold text-slate-700">{complaint.citizenName}</span></p>

                                                        <div className="space-y-5">
                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                                    <MapPin className="w-3.5 h-3.5" /> Lokasi Detail
                                                                </h4>
                                                                <p className="text-slate-700 font-medium bg-white p-3 rounded-lg border border-slate-200">
                                                                    {complaint.location}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                                    <AlertTriangle className="w-3.5 h-3.5" /> Deskripsi Masalah
                                                                </h4>
                                                                <p className="text-slate-700 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 text-sm">
                                                                    {complaint.description}
                                                                </p>
                                                            </div>

                                                            <div>
                                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                                                    <ImageIcon className="w-3.5 h-3.5" /> Foto Bukti
                                                                </h4>
                                                                {complaint.photo_url ? (
                                                                    <img src={complaint.photo_url} alt="Bukti" className="w-full max-h-48 object-cover rounded-lg border border-slate-200" />
                                                                ) : (
                                                                    <div className="h-32 w-full bg-slate-200 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                                                                        <span className="text-sm font-medium">Tidak ada foto dilampirkan</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* SISI KANAN: Form Keputusan Admin (Action) */}
                                                    <div className="md:col-span-2 bg-white p-6 sm:p-8 flex flex-col">
                                                        <DialogHeader className="mb-6 text-left">
                                                            <DialogTitle className="text-xl">Aksi Verifikasi</DialogTitle>
                                                            <DialogDescription className="text-xs">
                                                                Tentukan validitas dan tingkat urgensi laporan ini.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <form className="flex-1 flex flex-col space-y-6">
                                                            <div className="space-y-2.5">
                                                                <Label className="text-slate-700 font-bold">Tingkat Prioritas (SLA)</Label>
                                                                <Select
                                                                    value={activePriority[complaint.id] || "MEDIUM"}
                                                                    onValueChange={(val) => setActivePriority(prev => ({ ...prev, [complaint.id]: val }))}
                                                                >
                                                                    <SelectTrigger className="focus:ring-blue-500">
                                                                        <SelectValue placeholder="Pilih prioritas" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="LOW">Rendah (SLA 72 Jam)</SelectItem>
                                                                        <SelectItem value="MEDIUM">Sedang (SLA 48 Jam)</SelectItem>
                                                                        <SelectItem value="HIGH">Tinggi (SLA 24 Jam)</SelectItem>
                                                                        <SelectItem value="EMERGENCY">Darurat (SLA 6 Jam)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2.5">
                                                                <Label className="text-slate-700 font-bold">Kategori Spesifik</Label>
                                                                <Select
                                                                    value={activeCategoryId[complaint.id] || complaint.category_id || ""}
                                                                    onValueChange={(val) => setActiveCategoryId(prev => ({ ...prev, [complaint.id]: val }))}
                                                                >
                                                                    <SelectTrigger className="focus:ring-blue-500">
                                                                        <SelectValue placeholder="Koreksi kategori jika salah" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(categories || []).map((cat: any) => (
                                                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2.5 flex-1">
                                                                <Label className="text-slate-700 font-bold">Catatan Internal (Opsional)</Label>
                                                                <Textarea
                                                                    placeholder="Tambahkan instruksi khusus untuk petugas lapangan..."
                                                                    className="resize-none h-24 focus-visible:ring-blue-500 bg-slate-50"
                                                                    value={activeNotes[complaint.id] || ""}
                                                                    onChange={(e) => setActiveNotes(prev => ({ ...prev, [complaint.id]: e.target.value }))}
                                                                />
                                                            </div>

                                                            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-auto pt-4 border-t border-slate-100">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                                    disabled={rejectMutate.isPending}
                                                                    onClick={() => rejectMutate.mutate({ complaintId: complaint.id, adminId: user?.id || '', reason: 'Ditolak oleh Admin' })}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1.5" /> Tolak
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                                                                    disabled={verifyMutate.isPending}
                                                                    onClick={() => verifyMutate.mutate({
                                                                        complaintId: complaint.id,
                                                                        priority: (activePriority[complaint.id] || 'MEDIUM') as any,
                                                                        categoryId: activeCategoryId[complaint.id] || complaint.category_id,
                                                                        adminId: user?.id || '',
                                                                        notes: activeNotes[complaint.id] || ''
                                                                    })}
                                                                >
                                                                    {verifyMutate.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                                                                    Verifikasi & Teruskan
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>

                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        {/* ==== END OF MODAL ==== */}

                                    </TableCell>
                                </TableRow>
                            ))}
                            
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}