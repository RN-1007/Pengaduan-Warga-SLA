"use server"

import { createClient } from '@supabase/supabase-js';
import { CreateComplaintFormData, UpdateComplaintStatusFormData } from '../domain/schemas';
import { escalationRepository } from '../repositories/escalation.repository';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function getActiveCategoriesAction() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaint_categories')
    .select('id, name, description, sla_rules ( priority, resolution_time_hours )')
    .eq('is_active', true)
    .order('name', { ascending: true });
    
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function createComplaintAction(data: CreateComplaintFormData, citizenId: string, photoUrl?: string) {
  const supabase = getAdminSupabase();
  
  const { data: complaint, error } = await supabase
    .from('complaints')
    .insert({
      citizen_id: citizenId,
      category_id: data.category_id,
      title: data.title,
      description: data.description,
      location: data.location,
      photo_url: photoUrl,
      status: 'SUBMITTED',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return complaint;
}

export async function getComplaintsByCitizenAction(citizenId: string) {
  // Pseudo-cron for local testing: update SLAs before fetching
  await escalationRepository.processSlaEscalation().catch(console.error);

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name )
    `)
    .eq('citizen_id', citizenId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function getAssignedComplaintsAction() {
  // Pseudo-cron for local testing: update SLAs before fetching
  await escalationRepository.processSlaEscalation().catch(console.error);

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name )
    `)
    .in('status', ['ASSIGNED', 'IN_PROGRESS'])
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function addComplaintUpdateAction(payload: {
  complaintId: string;
  officerId: string;
  status: string;
  notes: string;
}) {
  const supabase = getAdminSupabase();
  
  const { error: updateError } = await supabase
    .from('complaints')
    .update({ 
      status: payload.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', payload.complaintId);
    
  if (updateError) throw new Error(updateError.message);

  const { error: insertError } = await supabase
    .from('complaint_updates')
    .insert({
      complaint_id: payload.complaintId,
      officer_id: payload.officerId,
      notes: payload.notes,
    });
    
  if (insertError) throw new Error(insertError.message);
  
  return true;
}

export async function getComplaintDetailAction(id: string) {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name, email, phone_number )
    `)
    .eq('id', id)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }
  return data?.[0] || null;
}

export async function updateComplaintAction(id: string, updateData: Partial<CreateComplaintFormData>, photoUrl?: string) {
  const supabase = getAdminSupabase();
  const payload: any = { ...updateData, updated_at: new Date().toISOString() };
  if (photoUrl !== undefined) {
    payload.photo_url = photoUrl;
  }
  
  const { data, error } = await supabase
    .from('complaints')
    .update(payload)
    .eq('id', id)
    .eq('status', 'SUBMITTED') // Safety check
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteComplaintAction(id: string) {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from('complaints')
    .delete()
    .eq('id', id)
    .eq('status', 'SUBMITTED'); // Ensure only submitted can be deleted

  if (error) {
    throw new Error(error.message);
  }
  return true;
}

export async function getAllComplaintsAction() {
  // Pseudo-cron for local testing: update SLAs before fetching
  await escalationRepository.processSlaEscalation().catch(console.error);

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function submitRatingAndCloseAction(payload: {
  complaintId: string;
  citizenId: string;
  score: number;
  feedback?: string;
}) {
  const supabase = getAdminSupabase();

  // 1. Insert rating
  const { error: ratingError } = await supabase
    .from('ratings')
    .insert({
      complaint_id: payload.complaintId,
      citizen_id: payload.citizenId,
      score: payload.score,
    });

  if (ratingError) throw new Error(ratingError.message);

  // 2. Update complaint status to RESOLVED
  const { error: updateError } = await supabase
    .from('complaints')
    .update({ status: 'RESOLVED', updated_at: new Date().toISOString() })
    .eq('id', payload.complaintId);

  if (updateError) throw new Error(updateError.message);

  // 3. Log the closure
  await supabase.from('complaint_updates').insert({
    complaint_id: payload.complaintId,
    officer_id: payload.citizenId,
    notes: `[SELESAI] Citizen memberikan rating ${payload.score}/5 dan me-review penanganan.`,
  });

  return true;
}
