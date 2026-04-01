"use server"

import { createClient } from '@supabase/supabase-js';
import { CreateComplaintFormData, UpdateComplaintStatusFormData } from '../domain/schemas';

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
    .select('id, name, description')
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
