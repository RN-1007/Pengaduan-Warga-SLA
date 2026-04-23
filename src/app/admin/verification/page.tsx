// File: src/app/admin/verification/page.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { authService } from "@/modules/auth/services/auth.service";
import { getActiveCategoriesAction } from "@/modules/complaints/actions/complaints.actions";
import {
    getPendingComplaintsAction,
    verifyComplaintAction,
    rejectComplaintAction,
} from "@/modules/admin/actions/verification.actions";
import { toast } from "sonner";
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
import {
    CheckCircle2,
    XCircle,
    Clock,
    MapPin,
    AlertTriangle,
    Image as ImageIcon,
    Loader2,
    ShieldCheck,
    FileSearch,
} from "lucide-react";
import { motion } from "framer-motion";
import { FilterBar } from "@/components/ui/filter-bar";
import { useFilteredData } from "@/hooks/use-filtered-data";

export default function VerificationPage() {
    const queryClient = useQueryClient();

    // ── Data Fetching via Server Actions (bypass RLS dengan service role key) ──
    const { data: user } = useQuery({
        queryKey: ["current-user"],
        queryFn: () => authService.getCurrentUser(),
    });

    const { data: pendingComplaints, isLoading } = useQuery({
        queryKey: ["pending-complaints"],
        queryFn: () => getPendingComplaintsAction(), // ✅ pakai server action
    });

    const { data: categories } = useQuery({
        queryKey: ["active-categories"],
        queryFn: () => getActiveCategoriesAction(),
    });

    // ── Form State (per-baris modal) ──
    const [activePriority, setActivePriority] = useState<Record<string, string>>({});
    const [activeCategoryId, setActiveCategoryId] = useState<Record<string, string>>({});
    const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});

    // ── Mutations via Server Actions ──
    const verifyMutate = useMutation({
        mutationFn: (data: any) => verifyComplaintAction(data), // ✅ pakai server action
        onSuccess: () => {
            toast.success("Laporan berhasil diverifikasi! SLA telah aktif.");
            queryClient.invalidateQueries({ queryKey: ["pending-complaints"] });
            queryClient.invalidateQueries({ queryKey: ["verified-complaints"] });
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
        },
        onError: (err: any) => toast.error("Gagal memverifikasi: " + err.message),
    });

    const rejectMutate = useMutation({
        mutationFn: (data: any) => rejectComplaintAction(data), // ✅ pakai server action
        onSuccess: () => {
            toast.success("Laporan telah ditolak.");
            queryClient.invalidateQueries({ queryKey: ["pending-complaints"] });
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
        },
        onError: (err: any) => toast.error("Gagal menolak laporan: " + err.message),
    });

    // ── Map raw DB data ke shape yang dibutuhkan UI ──
    const mappedComplaints = (pendingComplaints || []).map((c: any) => ({
        id: c.id,
        citizenName: c.users?.full_name || "-",
        title: c.title,
        category: c.complaint_categories?.name || "Lainnya",
        location: c.location,
        description: c.description,
        photo_url: c.photo_url,
        category_id: c.category_id,
        date: format(new Date(c.created_at), "dd MMM yyyy", { locale: idLocale }),
        status: c.status,
    }));

    const {
        searchQuery,
        setSearchQuery,
        sortOption,
        setSortOption,
        filteredData: complaints
    } = useFilteredData({
        initialData: mappedComplaints,
        searchKeys: ['title', 'location', 'citizenName', 'category', 'id'],
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">

            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2"
            >
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-white border border-slate-200 shadow-sm rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Verifikasi Laporan
                        </h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            Tinjau, tentukan prioritas, dan teruskan laporan warga ke petugas lapangan.
                        </p>
                    </div>
                </div>

                <Badge
                    variant="secondary"
                    className="self-start sm:self-auto bg-amber-100 text-amber-700 hover:bg-amber-100 px-3 py-1.5 text-sm rounded-xl border border-amber-200 gap-1.5"
                >
                    <Clock className="w-3.5 h-3.5" />
                    {isLoading ? "..." : complaints.length} Menunggu Review
                </Badge>
            </motion.div>

            {/* ── Table Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex-1"
            >
                {/* Card inner header */}
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <FileSearch className="w-5 h-5 text-slate-400" />
                    <h2 className="text-lg font-semibold text-slate-800">Antrean Verifikasi</h2>
                    <span className="ml-auto text-sm text-slate-400">
                        {isLoading ? "Memuat..." : `${complaints.length} laporan perlu ditindak`}
                    </span>
                </div>

                <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                    <FilterBar 
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                        placeholder="Cari ID, judul, kategori, pelapor..."
                        totalFiltered={complaints.length}
                        totalItems={mappedComplaints.length}
                    />
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/80">
                        <TableRow>
                            <TableHead className="w-[110px] pl-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                ID
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Tanggal
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Pelapor
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Judul Laporan
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Kategori
                            </TableHead>
                            <TableHead className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider pr-6">
                                Aksi
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                        <span>Memuat laporan...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : complaints.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <CheckCircle2 className="w-10 h-10 text-green-300" />
                                        <p className="font-medium text-slate-500">
                                            {searchQuery ? "Tidak ada laporan yang cocok." : "Semua laporan sudah terverifikasi!"}
                                        </p>
                                        <p className="text-sm">
                                            {searchQuery ? "Coba kata kunci pencarian yang lain." : "Tidak ada laporan baru yang menunggu."}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            complaints.map((complaint) => (
                                <TableRow
                                    key={complaint.id}
                                    className="hover:bg-slate-50/80 transition-colors"
                                >
                                    <TableCell className="pl-6 font-mono text-xs font-medium text-slate-500 uppercase">
                                        {complaint.id.substring(0, 8)}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">
                                        {complaint.date}
                                    </TableCell>
                                    <TableCell className="text-slate-700 font-medium text-sm">
                                        {complaint.citizenName}
                                    </TableCell>
                                    <TableCell className="max-w-[250px] truncate font-semibold text-slate-900 text-sm">
                                        {complaint.title}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="text-slate-600 font-normal bg-slate-50 border-slate-200"
                                        >
                                            {complaint.category}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center pr-6">

                                        {/* ── Modal Verifikasi ── */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 shadow-sm rounded-lg h-8 px-3 text-xs font-medium transition-all"
                                                >
                                                    Tinjau Laporan
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-[860px] p-0 overflow-hidden rounded-2xl border-slate-200 shadow-xl">

                                                <div className="grid grid-cols-1 md:grid-cols-5 min-h-[520px]">

                                                    {/* KIRI: Informasi Laporan */}
                                                    <div className="md:col-span-3 bg-slate-50 p-6 sm:p-8 border-r border-slate-100 flex flex-col">
                                                        <div className="flex items-center gap-2 mb-5">
                                                            <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs">
                                                                Laporan Baru
                                                            </Badge>
                                                            <span className="text-sm text-slate-400 font-medium">
                                                                {complaint.date}
                                                            </span>
                                                        </div>

                                                        <h2 className="text-xl font-bold text-slate-900 mb-1 leading-snug">
                                                            {complaint.title}
                                                        </h2>
                                                        <p className="text-sm text-slate-500 mb-6">
                                                            Dilaporkan oleh:{" "}
                                                            <span className="font-semibold text-slate-700">
                                                                {complaint.citizenName}
                                                            </span>
                                                        </p>

                                                        <div className="space-y-4 flex-1">
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
                                                                <p className="text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
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
                                                                        className="w-full max-h-44 object-cover rounded-xl border border-slate-200 shadow-sm"
                                                                    />
                                                                ) : (
                                                                    <div className="h-28 w-full bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                                                                        <span className="text-sm">Tidak ada foto dilampirkan</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* KANAN: Form Keputusan Admin */}
                                                    <div className="md:col-span-2 bg-white p-6 sm:p-8 flex flex-col">
                                                        <DialogHeader className="mb-6 text-left">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <DialogTitle className="text-lg">Aksi Verifikasi</DialogTitle>
                                                            </div>
                                                            <DialogDescription className="text-xs text-slate-400">
                                                                Tentukan validitas dan tingkat urgensi laporan ini.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <form className="flex-1 flex flex-col space-y-5">
                                                            <div className="space-y-2">
                                                                <Label className="text-slate-700 font-semibold text-sm">
                                                                    Tingkat Prioritas (SLA)
                                                                </Label>
                                                                <Select
                                                                    value={activePriority[complaint.id] || "MEDIUM"}
                                                                    onValueChange={(val) =>
                                                                        setActivePriority((prev) => ({
                                                                            ...prev,
                                                                            [complaint.id]: val,
                                                                        }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500 h-10">
                                                                        <SelectValue placeholder="Pilih prioritas" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-xl">
                                                                        <SelectItem value="LOW">🟢 Rendah (SLA 72 Jam)</SelectItem>
                                                                        <SelectItem value="MEDIUM">🟡 Sedang (SLA 48 Jam)</SelectItem>
                                                                        <SelectItem value="HIGH">🟠 Tinggi (SLA 24 Jam)</SelectItem>
                                                                        <SelectItem value="EMERGENCY">🔴 Darurat (SLA 6 Jam)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label className="text-slate-700 font-semibold text-sm">
                                                                    Kategori Spesifik
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        activeCategoryId[complaint.id] ||
                                                                        complaint.category_id ||
                                                                        ""
                                                                    }
                                                                    onValueChange={(val) =>
                                                                        setActiveCategoryId((prev) => ({
                                                                            ...prev,
                                                                            [complaint.id]: val,
                                                                        }))
                                                                    }
                                                                >
                                                                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-blue-500 h-10">
                                                                        <SelectValue placeholder="Koreksi kategori jika salah" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-xl">
                                                                        {(categories || []).map((cat: any) => (
                                                                            <SelectItem key={cat.id} value={cat.id}>
                                                                                {cat.name}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>

                                                            <div className="space-y-2 flex-1">
                                                                <Label className="text-slate-700 font-semibold text-sm">
                                                                    Catatan Internal{" "}
                                                                    <span className="font-normal text-slate-400">(Opsional)</span>
                                                                </Label>
                                                                <Textarea
                                                                    placeholder="Tambahkan instruksi khusus untuk petugas lapangan..."
                                                                    className="resize-none h-28 rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50 text-sm"
                                                                    value={activeNotes[complaint.id] || ""}
                                                                    onChange={(e) =>
                                                                        setActiveNotes((prev) => ({
                                                                            ...prev,
                                                                            [complaint.id]: e.target.value,
                                                                        }))
                                                                    }
                                                                />
                                                            </div>

                                                            <DialogFooter className="flex-col gap-2 mt-auto pt-4 border-t border-slate-100 sm:flex-row">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    className="w-full sm:flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl h-10"
                                                                    disabled={rejectMutate.isPending}
                                                                    onClick={() =>
                                                                        rejectMutate.mutate({
                                                                            complaintId: complaint.id,
                                                                            adminId: user?.id || "",
                                                                            reason: "Ditolak oleh Admin",
                                                                        })
                                                                    }
                                                                >
                                                                    {rejectMutate.isPending ? (
                                                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                                    ) : (
                                                                        <XCircle className="w-4 h-4 mr-1.5" />
                                                                    )}
                                                                    Tolak
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-xl h-10"
                                                                    disabled={verifyMutate.isPending}
                                                                    onClick={() =>
                                                                        verifyMutate.mutate({
                                                                            complaintId: complaint.id,
                                                                            priority: (activePriority[complaint.id] || "MEDIUM") as any,
                                                                            categoryId:
                                                                                activeCategoryId[complaint.id] ||
                                                                                complaint.category_id,
                                                                            adminId: user?.id || "",
                                                                            notes: activeNotes[complaint.id] || "",
                                                                        })
                                                                    }
                                                                >
                                                                    {verifyMutate.isPending ? (
                                                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                                                    ) : (
                                                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                                    )}
                                                                    Verifikasi & Teruskan
                                                                </Button>
                                                            </DialogFooter>
                                                        </form>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        {/* ── End Modal ── */}

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </motion.div>
        </div>
    );
}