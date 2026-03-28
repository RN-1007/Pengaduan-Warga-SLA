"use client"

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { complaintsService } from '@/modules/complaints/services/complaints.service'
import { ratingService } from '@/modules/complaints/services/rating.service'
import { authService } from '@/modules/auth/services/auth.service'
import { RatingForm } from '@/modules/complaints/components/rating-form'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, AlertTriangle, User } from 'lucide-react'

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

export default function CitizenComplaintPage() {
  const { id } = useParams()
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser()
  })

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['complaint', id],
    queryFn: () => complaintsService.getComplaintDetail(id as string),
    enabled: !!id
  })

  const { data: rating } = useQuery({
    queryKey: ['rating', id],
    queryFn: () => ratingService.getRating(id as string),
    enabled: !!id && complaint?.status === 'CLOSED'
  })

  if (isLoading || !complaint || !user) {
    return <div className="p-8 text-center text-muted-foreground">Memuat detail...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 flex flex-col min-h-screen">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Detail Pengaduan
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{complaint.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(complaint.created_at).toLocaleDateString('id-ID')}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {complaint.location}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusBadgeStatus(complaint.status) as any} className="text-sm px-3 py-1">
              {complaint.status}
            </Badge>
            {complaint.is_escalated && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Eskalasi
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Deskripsi</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">{complaint.description}</p>

            {complaint.photo_url && (
              <div className="mt-4">
                <img src={complaint.photo_url} alt="Foto Bukti" className="rounded-md w-full max-h-[400px] object-cover" />
              </div>
            )}
          </div>

          <div className="bg-card border rounded-lg p-6 shadow-sm">
             <h2 className="text-xl font-semibold mb-4">Timeline Update</h2>
             {/* We ideally fetch complaint_updates here, but for now we say none if empty */}
             <p className="text-muted-foreground italic">Belum ada pembaruan ditarik.</p>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold mb-3">Informasi Pelapor</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{complaint.users?.full_name || complaint.users?.email}</span>
              </div>
            </div>
            
            <h3 className="font-semibold mt-6 mb-3">Kategori</h3>
            <Badge variant="outline">{complaint.complaint_categories?.name}</Badge>
            
            {complaint.priority && (
              <>
                <h3 className="font-semibold mt-6 mb-3">Prioritas</h3>
                <Badge variant={complaint.priority === 'EMERGENCY' ? 'destructive' : 'default'}>
                  {complaint.priority}
                </Badge>
              </>
            )}
          </div>

          {complaint.status === 'CLOSED' && (
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-3">Penilaian Kepuasan</h3>
              {rating ? (
                <div>
                  <div className="flex gap-1 text-yellow-500 mb-2">
                    {Array(rating.score).fill(0).map((_, i) => <span key={i}>★</span>)}
                  </div>
                  {rating.feedback && <p className="text-sm text-muted-foreground">"{rating.feedback}"</p>}
                </div>
              ) : (
                <RatingForm complaintId={complaint.id} citizenId={user.id} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
