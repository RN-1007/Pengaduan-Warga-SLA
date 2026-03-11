// File: src/repositories/supabase/complaint.repository.ts
import { createClient } from '../../lib/supabase/client';
import type { ComplaintCategory } from '@/types/database.types';
import type { CreateComplaintInput } from '@/modules/complaints/validations';

export const complaintRepository = {
  async getActiveCategories(): Promise<ComplaintCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('complaint_categories')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data;
  },

  async createComplaint(payload: CreateComplaintInput, citizenId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('complaints')
      .insert({ ...payload, citizen_id: citizenId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};