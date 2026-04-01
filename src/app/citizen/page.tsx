"use client"

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/modules/auth/services/auth.service'
import { getComplaintsByCitizenAction } from '@/modules/complaints/actions/complaints.actions'
import { PlusCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreateComplaintForm } from '@/modules/complaints/components/create-complaint-form'

function getStatusBadgeStatus(status: string) {
  switch (status) {
    case 'SUBMITTED': return 'secondary'
    case 'VERIFIED': return 'outline'
    case 'ASSIGNED': return 'default'
    case 'IN_PROGRESS': return 'default'
    case 'RESOLVED': return 'secondary' // should be green if custom exists
    case 'CLOSED': return 'outline'
    default: return 'default'
  }
}

export default function CitizenDashboardPage() {
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

  async function handleLogout() {
    await authService.logout()
    router.push('/auth/login')
  }

  if (!user) return <div className="p-8">Memuat dashboard...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Citizen</h1>
          <p className="text-muted-foreground mt-1">Halo, {user?.profile?.full_name || user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Buat Pengaduan
          </Button>
          {/* <Button variant="outline" onClick={handleLogout}>
             <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button> */}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="border rounded-lg p-6 bg-card shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Laporan Anda</p>
          <h2 className="text-3xl font-bold mt-2">{complaints?.length || 0}</h2>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg shadow-sm bg-card overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Laporan Terbaru</h2>
          <Button variant="outline" size="sm" onClick={() => router.push('/citizen/history')}>
            Lihat Semua
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Memuat data...</TableCell>
              </TableRow>
            ) : complaints?.length ? (
              complaints.slice(0, 3).map((c: any) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => router.push(`/citizen/complaints/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.complaint_categories?.name || '-'}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeStatus(c.status) as any}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString('id-ID')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada laporan pengaduan.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for Creation */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Pengaduan Baru</DialogTitle>
            <DialogDescription>
              Isi form di bawah dengan informasi sejelas mungkin. Tambahkan foto bukti untuk mempercepat penanganan.
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