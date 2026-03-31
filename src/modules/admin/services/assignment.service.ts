import { createClient } from '@/lib/supabase/client'

export const assignmentService = {
  /** Semua laporan yg sudah VERIFIED dan belum diassign ke officer */
  async getVerifiedComplaints() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_categories ( name ),
        users!complaints_citizen_id_fkey ( full_name )
      `)
      .eq('status', 'VERIFIED')
      .order('sla_deadline', { ascending: true })
    if (error) throw new Error(error.message)
    return data || []
  },

  /** Semua officer yang tersedia */
  async getAvailableOfficers() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, role, phone_number')
      .eq('role', 'OFFICER')
      .order('full_name', { ascending: true })
    if (error) throw new Error(error.message)
    return data || []
  },

  /** Assign laporan ke officer */
  async assignComplaint(payload: { complaintId: string; officerId: string; assignedBy: string }) {
    const supabase = createClient()

    // Insert ke tabel assignment
    const { error: assignErr } = await supabase
      .from('complaint_assignments')
      .insert({
        complaint_id: payload.complaintId,
        officer_id: payload.officerId,
        assigned_by: payload.assignedBy,
      })
    if (assignErr) throw new Error(assignErr.message)

    // Update status laporan jadi ASSIGNED
    const { error: updateErr } = await supabase
      .from('complaints')
      .update({ status: 'ASSIGNED', updated_at: new Date().toISOString() })
      .eq('id', payload.complaintId)
    if (updateErr) throw new Error(updateErr.message)

    // Log ke complaint_updates
    await supabase.from('complaint_updates').insert({
      complaint_id: payload.complaintId,
      officer_id: payload.assignedBy,
      status: 'ASSIGNED',
      notes: `[DITUGASKAN] Laporan ditugaskan oleh Admin ke Officer ID: ${payload.officerId}`,
    })

    return true
  },
}
