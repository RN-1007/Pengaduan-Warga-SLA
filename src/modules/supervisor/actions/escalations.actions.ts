"use server"

import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function getEscalatedComplaintsAction() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name )
    `)
    .eq('is_escalated', true)
    .neq('status', 'RESOLVED')
    .neq('status', 'CLOSED')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAllOfficersAction() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, role')
    .in('role', ['OFFICER', 'SUPERVISOR'])
    .order('full_name', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function reassignOfficerAction(payload: { complaintId: string, officerId: string, supervisorId: string, notes: string }) {
  const supabase = getAdminSupabase();
  
  // Assign task to new officer
  const { error: assignError } = await supabase
    .from('complaint_assignments')
    .insert({
      complaint_id: payload.complaintId,
      officer_id: payload.officerId,
      assigned_by: payload.supervisorId
    });

  if (assignError) throw new Error(assignError.message);

  // Log exactly what happened in updates
  await supabase
    .from('complaint_updates')
    .insert({
      complaint_id: payload.complaintId,
      officer_id: payload.supervisorId, // Who made the update
      status: 'ASSIGNED',
      notes: `[ESKALASI: REASSIGN] Dialihkan ke petugas baru. Catatan Supervisor: ${payload.notes}`
    });

  // Turn off escalation flag and reset status to assigned
  await supabase
    .from('complaints')
    .update({ is_escalated: false, status: 'ASSIGNED', updated_at: new Date().toISOString() })
    .eq('id', payload.complaintId);

  return true;
}

export async function forceResolveAction(payload: { complaintId: string, supervisorId: string, notes: string }) {
  const supabase = getAdminSupabase();

  await supabase
    .from('complaint_updates')
    .insert({
      complaint_id: payload.complaintId,
      officer_id: payload.supervisorId,
      status: 'RESOLVED',
      notes: `[ESKALASI: FORCE RESOLVE] Kasus ditutup paksa oleh Supervisor. Catatan: ${payload.notes}`
    });

  const { error } = await supabase
    .from('complaints')
    .update({ is_escalated: false, status: 'RESOLVED', updated_at: new Date().toISOString() })
    .eq('id', payload.complaintId);

  if (error) throw new Error(error.message);
  return true;
}

export async function deescalateAction(payload: { complaintId: string, supervisorId: string, notes: string }) {
  const supabase = getAdminSupabase();

  await supabase
    .from('complaint_updates')
    .insert({
      complaint_id: payload.complaintId,
      officer_id: payload.supervisorId,
      status: 'IN_PROGRESS',
      notes: `[ESKALASI: DICABUT] Eskalasi dibatalkan oleh Supervisor. Catatan: ${payload.notes}`
    });

  const { error } = await supabase
    .from('complaints')
    .update({ is_escalated: false, updated_at: new Date().toISOString() })
    .eq('id', payload.complaintId);

  if (error) throw new Error(error.message);
  return true;
}
