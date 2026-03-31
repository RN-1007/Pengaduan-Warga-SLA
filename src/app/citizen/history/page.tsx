"use client"

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth.service'
import { getComplaintsByCitizenAction } from '@/modules/complaints/actions/complaints.actions'
import { useRouter } from 'next/navigation'
import { PlusCircle, ClipboardList } from 'lucide-react'
import { useState } from 'react'

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

function getStatusBadgeStatus(status: string) {
  switch (status) {
    case 'SUBMITTED': return 'secondary'
    case 'VERIFIED': return 'outline'
    case 'ASSIGNED': return 'default'
    case 'IN_PROGRESS': return 'default'
    case 'RESOLVED': return 'secondary' 
    case 'CLOSED': return 'outline'
    default: return 'default'
  }
}

export default function CitizenHistoryPage() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['complaints', user?.id],
    queryFn: () => getComplaintsByCitizenAction(user?.id as string),
    enabled: !!user?.id
  });

  if (!user) return <div className="p-8">Memuat riwayat...</div>

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Pengaduan</h1>
          <p className="text-muted-foreground mt-1">Daftar seluruh laporan yang pernah Anda buat</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
           <PlusCircle className="w-4 h-4" />
           Buat Pengaduan Baru
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-xl shadow-sm bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Judul Pengaduan</TableHead>
              <TableHead className="font-semibold text-slate-700">Kategori</TableHead>
              <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Lokasi</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Tanggal Pembuatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  Mengambil data riwayat Anda...
                </TableCell>
              </TableRow>
            ) : complaints?.length ? (
              complaints.map((c: any) => (
                <TableRow 
                  key={c.id} 
                  className="cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => router.push(`/citizen/complaints/${c.id}`)}
                >
                  <TableCell className="font-medium text-slate-900">{c.title}</TableCell>
                  <TableCell>
                     <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                        {c.complaint_categories?.name || '-'}
                     </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-slate-500 max-w-[200px] truncate" title={c.location}>
                    {c.location}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeStatus(c.status) as any}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 tabular-nums">
                    {new Date(c.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  Belum ada laporan pengaduan yang Anda buat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
    </div>
  )
}
