import { createClient } from '@/lib/supabase/client'
import { CreateComplaintFormData, UpdateComplaintStatusFormData } from '../domain/schemas'
import { Complaint, ComplaintStatus } from '@/types/database.types'

export const complaintsRepository = {
  /** Create a new complaint (Citizen) */
  async createComplaint(data: CreateComplaintFormData, citizenId: string, photoUrl?: string) {
    const supabase = createClient();
    
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

    if (error) throw error;
    return complaint;
  },

  /** Get complaints list. Can be filtered by citizen_id or status etc. */
  async getComplaints(filters?: { citizen_id?: string; status?: ComplaintStatus; is_escalated?: boolean }) {
    const supabase = createClient();
    let query = supabase.from('complaints').select(`
      *,
      complaint_categories ( name ),
      users!complaints_citizen_id_fkey ( full_name )
    `).order('created_at', { ascending: false });

    if (filters?.citizen_id) {
      query = query.eq('citizen_id', filters.citizen_id);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.is_escalated !== undefined) {
      query = query.eq('is_escalated', filters.is_escalated);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getComplaintById(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_categories ( name ),
        users!complaints_citizen_id_fkey ( full_name, email, phone_number )
      `)
      .eq('id', id)
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  },

  /** Update a complaint's status (Admin, Officer) */
  async updateComplaintStatus(id: string, data: UpdateComplaintStatusFormData) {
    const supabase = createClient();
    
    const updatePayload: any = {
      status: data.status,
      updated_at: new Date().toISOString()
    };
    
    if (data.priority) updatePayload.priority = data.priority;

    // If verified or assigned, we calculate SLA deadline in edge functions or DB triggers,
    // but we can also set it locally if needed.

    const { data: updated, error } = await supabase
      .from('complaints')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Optional: write to complaint_updates tracking log here or via DB Trigger
    return updated;
  },
  
  /** Fetch all categories */
  async getCategories() {
    const supabase = createClient();
    const { data, error } = await supabase.from('complaint_categories').select('*').eq('is_active', true);
    if (error) throw error;
    return data;
  }
}
