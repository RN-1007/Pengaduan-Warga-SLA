"use client"

import { useQuery } from '@tanstack/react-query'
import { complaintsService } from '@/modules/complaints/services/complaints.service'
import { AdminComplaintTable } from '@/modules/complaints/components/admin-complaint-table'
import { authService } from '@/modules/auth/services/auth.service'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OfficerDashboardPage() {
  const router = useRouter()
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  });

  const { data: complaints, isLoading } = useQuery({
    queryKey: ['all-complaints'],
    queryFn: () => complaintsService.getAllComplaints()
  });

  async function handleLogout() {
    await authService.logout()
    router.push('/auth/login')
  }

  // Filter complaints based on assigned status. Ideally filtered from DB directly.
  const activeTasks = complaints?.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS').length || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Officer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Daftar tugas pengaduan yang harus Anda tangani.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
           <LogOut className="w-4 h-4 mr-2" /> Keluar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
         <div className="border rounded-lg p-6 bg-card shadow-sm">
           <p className="text-sm font-medium text-muted-foreground">Tugas Aktif (Assigned / In Progress)</p>
           <h2 className="text-3xl font-bold mt-2 text-blue-600">{activeTasks}</h2>
         </div>
         <div className="border rounded-lg p-6 bg-card shadow-sm">
           <p className="text-sm font-medium text-muted-foreground">Total Keseluruhan Laporan Sistem</p>
           <h2 className="text-3xl font-bold mt-2">{complaints?.length || 0}</h2>
         </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-card flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Tugas Laporan Anda</h2>
        </div>
        <div className="p-6">
          {/* Using AdminComplaintTable as generic status updater for now */}
          <AdminComplaintTable complaints={complaints || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
