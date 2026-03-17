// File: src/app/citizen/page.tsx
"use client"; // Tambahkan ini karena kita menggunakan interaksi klik (Modal)

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, CheckCircle, PlusCircle, UploadCloud } from "lucide-react";

export default function CitizenDashboard() {
  const mockComplaints = [
    { id: "1", title: "Jalan Berlubang di RT 04", status: "VERIFIED", date: "17 Mar 2026" },
    { id: "2", title: "Lampu Jalan Mati", status: "IN_PROGRESS", date: "15 Mar 2026" },
    { id: "3", title: "Tumpukan Sampah Liar", status: "RESOLVED", date: "10 Mar 2026" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Warga</h1>
          <p className="text-slate-500">Pantau status laporan pengaduan Anda di sini.</p>
        </div>
        
        {/* === MODAL TRIGGER & CONTENT === */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="w-4 h-4" /> Buat Laporan Baru
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">Buat Laporan Baru</DialogTitle>
              <DialogDescription>
                Sampaikan detail masalah infrastruktur di lingkungan Anda.
              </DialogDescription>
            </DialogHeader>
            
            <form className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">Judul Laporan <span className="text-red-500">*</span></Label>
                <Input id="title" placeholder="Contoh: Jalan berlubang di depan Alfamart RT 04" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-medium">Kategori <span className="text-red-500">*</span></Label>
                  <Select required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastruktur">Infrastruktur & Jalan</SelectItem>
                      <SelectItem value="kebersihan">Kebersihan & Sampah</SelectItem>
                      <SelectItem value="fasilitas">Fasilitas Umum</SelectItem>
                      <SelectItem value="keamanan">Ketertiban & Keamanan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="font-medium">Lokasi <span className="text-red-500">*</span></Label>
                  <Input id="location" placeholder="Contoh: Jl. Merdeka No.15" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium">Deskripsi <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Ceritakan detail masalahnya..." 
                  className="min-h-[100px] resize-y" 
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo" className="font-medium">Lampiran Foto (Opsional)</Label>
                <label htmlFor="photo" className="flex items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-600">Klik untuk unggah foto</span>
                  </div>
                  <Input id="photo" type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              <DialogFooter className="pt-4 border-t">
                {/* Tombol Batal otomatis menutup Modal karena struktur Shadcn */}
                <Button type="button" variant="outline">Batal</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Kirim Laporan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        {/* === END OF MODAL === */}

      </div>

      {/* Statistik Section (Tetap sama) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Laporan</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-slate-500 mt-1">Sepanjang waktu</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Sedang Diproses</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-slate-500 mt-1">Menunggu penyelesaian</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Selesai</CardTitle>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-slate-500 mt-1">Laporan terselesaikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Riwayat Laporan (Tetap sama) */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Laporan Terakhir</CardTitle>
          <CardDescription>Daftar 5 laporan terakhir yang Anda buat.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul Laporan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockComplaints.map((complaint) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.title}</TableCell>
                  <TableCell>{complaint.date}</TableCell>
                  <TableCell>
                    {complaint.status === "VERIFIED" && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Terverifikasi</Badge>}
                    {complaint.status === "IN_PROGRESS" && <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Diproses</Badge>}
                    {complaint.status === "RESOLVED" && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Selesai</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Detail</Button>
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