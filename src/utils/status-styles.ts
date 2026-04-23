// Shared status badge styling utility
// Used across all dashboards for consistent complaint status display

export function getStatusStyle(status: string) {
  switch (status) {
    case 'SUBMITTED': return { label: 'Menunggu', className: 'bg-amber-50 text-amber-700 border-amber-200' }
    case 'VERIFIED': return { label: 'Terverifikasi', className: 'bg-violet-50 text-violet-700 border-violet-200' }
    case 'ASSIGNED': return { label: 'Ditugaskan', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    case 'IN_PROGRESS': return { label: 'Diproses', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' }
    case 'RESOLVED': return { label: 'Selesai', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    default: return { label: status, className: 'bg-slate-50 text-slate-700 border-slate-200' }
  }
}

export function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'LOW': return { label: 'Rendah', className: 'bg-green-50 text-green-700 border-green-200' }
    case 'MEDIUM': return { label: 'Sedang', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
    case 'HIGH': return { label: 'Tinggi', className: 'bg-orange-50 text-orange-700 border-orange-200' }
    case 'EMERGENCY': return { label: 'Darurat', className: 'bg-red-50 text-red-700 border-red-200' }
    default: return { label: priority || '-', className: 'bg-slate-50 text-slate-500 border-slate-200' }
  }
}
