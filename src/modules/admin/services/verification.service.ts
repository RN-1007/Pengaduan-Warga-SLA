import { createClient } from '@/lib/supabase/client'
import { ComplaintPriority, SLA_RESOLUTION_HOURS } from '@/types/database.types'
import { addHours } from 'date-fns'

export const verificationService = {
  async getPendingComplaints() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('complaints')
      .select(`*, complaint_categories ( name ), users!complaints_citizen_id_fkey ( full_name )`)
      .eq('status', 'SUBMITTED')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  },

  async verifyComplaint(payload: {
    complaintId: string
    priority: ComplaintPriority
    categoryId: string
    adminId: string
    notes?: string
  }) {
    const supabase = createClient()
    const slaHours = SLA_RESOLUTION_HOURS[payload.priority] || 72
    const deadline = addHours(new Date(), slaHours).toISOString()

    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status: 'VERIFIED',
        priority: payload.priority,
        category_id: payload.categoryId,
        sla_deadline: deadline,
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.complaintId)

    if (updateError) throw new Error(updateError.message)

    const logNotes = payload.notes
      ? `[VERIFIKASI] Diterima dengan catatan: ${payload.notes}`
      : `[VERIFIKASI] Laporan diterima. Prioritas: ${payload.priority}`

    await supabase.from('complaint_updates').insert({
      complaint_id: payload.complaintId,
      officer_id: payload.adminId,
      status: 'VERIFIED',
      notes: logNotes,
    })

    return true
  },

  async rejectComplaint(payload: {
    complaintId: string
    adminId: string
    reason: string
  }) {
    const supabase = createClient()

    const { error } = await supabase
      .from('complaints')
      .update({ status: 'CLOSED', updated_at: new Date().toISOString() })
      .eq('id', payload.complaintId)

    if (error) throw new Error(error.message)

    await supabase.from('complaint_updates').insert({
      complaint_id: payload.complaintId,
      officer_id: payload.adminId,
      status: 'CLOSED',
      notes: `[DITOLAK] ${payload.reason}`,
    })

    return true
  }
}
