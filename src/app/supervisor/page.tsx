"use client"

import { useQuery } from '@tanstack/react-query'
import { complaintsService } from '@/modules/complaints/services/complaints.service'
import { AdminComplaintTable } from '@/modules/complaints/components/admin-complaint-table'
import { authService } from '@/modules/auth/services/auth.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SupervisorDashboardPage() {
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

  // Analytics Computation
  const total = complaints?.length || 0;
  const processed = complaints?.filter(c => c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS' || c.status === 'VERIFIED').length || 0;
  const resolved = complaints?.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length || 0;
  const escalated = complaints?.filter(c => c.is_escalated).length || 0;
  
  const complianceRate = total > 0 ? Math.round(((total - escalated) / total) * 100) : 100;

  // Average completion time
  let totalHours = 0;
  let resolvedCountForAvg = 0;
  if (complaints) {
    complaints.forEach(c => {
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        const created = new Date(c.created_at).getTime();
        const updated = new Date(c.updated_at).getTime();
        totalHours += (updated - created) / (1000 * 60 * 60);
        resolvedCountForAvg++;
      }
    });
  }
  const avgResolutionTime = resolvedCountForAvg > 0 ? (totalHours / resolvedCountForAvg).toFixed(1) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor kinerja penanganan, eskalasi sistem, dan SLA.</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
           <LogOut className="w-4 h-4 mr-2" /> Keluar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
         <div className="border rounded-lg p-6 bg-card shadow-sm col-span-1">
           <p className="text-sm font-medium text-muted-foreground">Total Pengaduan</p>
           <h2 className="text-3xl font-bold mt-2">{total}</h2>
         </div>
         <div className="border rounded-lg p-6 bg-card shadow-sm col-span-1">
           <p className="text-sm font-medium text-muted-foreground">Sedang Diproses</p>
           <h2 className="text-3xl font-bold mt-2 text-blue-600">{processed}</h2>
         </div>
         <div className="border rounded-lg p-6 bg-card shadow-sm col-span-1">
           <p className="text-sm font-medium text-muted-foreground">Selesai</p>
           <h2 className="text-3xl font-bold mt-2 text-green-600">{resolved}</h2>
         </div>
         <div className="border rounded-lg p-6 bg-card shadow-sm col-span-1">
           <p className="text-sm font-medium text-muted-foreground">Kepatuhan SLA</p>
           <h2 className={`text-3xl font-bold mt-2 ${complianceRate >= 80 ? 'text-green-600' : 'text-red-500'}`}>{complianceRate}%</h2>
         </div>
         <div className="border border-red-200 rounded-lg p-6 bg-red-50 shadow-sm text-red-900 col-span-1">
           <p className="text-sm font-medium">Laporan Eskalasi</p>
           <h2 className="text-3xl font-bold mt-2">{escalated}</h2>
         </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-6 bg-card shadow-sm col-span-1 flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-semibold mb-2">Rata-rata Waktu Penyelesaian</h3>
            <div className="text-5xl font-extrabold text-slate-800">{avgResolutionTime}</div>
            <p className="text-muted-foreground mt-2">Jam per pengaduan</p>
        </div>
        <div className="border rounded-lg shadow-sm bg-card md:col-span-2 p-6">
           <h3 className="text-lg font-semibold mb-4">Statistik Kinerja Mingguan</h3>
           {/* Visual mock of a chart */}
           <div className="h-32 flex items-end gap-2 mt-4 opacity-70">
              <div className="bg-blue-200 w-1/6 rounded-t-sm" style={{ height: '40%' }}></div>
              <div className="bg-blue-300 w-1/6 rounded-t-sm" style={{ height: '70%' }}></div>
              <div className="bg-blue-400 w-1/6 rounded-t-sm" style={{ height: '50%' }}></div>
              <div className="bg-blue-500 w-1/6 rounded-t-sm" style={{ height: '90%' }}></div>
              <div className="bg-blue-600 w-1/6 rounded-t-sm" style={{ height: '60%' }}></div>
              <div className="bg-blue-700 w-1/6 rounded-t-sm" style={{ height: '100%' }}></div>
           </div>
           <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
              <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
           </div>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm bg-card flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tabel Monitoring Pengaduan</h2>
          <Badge variant="outline">Live Sync</Badge>
        </div>
        <div className="p-6">
          <AdminComplaintTable complaints={complaints || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
