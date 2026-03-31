import { createClient } from '@/lib/supabase/client'
import { CreateCategoryFormData } from '../domain/schemas'
import { ComplaintCategory, SlaRule } from '@/types/database.types'

export const adminRepository = {
  async getCategoriesWithSla() {
    const supabase = createClient();
    // Fetch categories and their SLA rules
    const { data, error } = await supabase
      .from('complaint_categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createCategory(data: CreateCategoryFormData) {
    const supabase = createClient();
    
    // 1. Insert Category
    const { data: category, error: catError } = await supabase
      .from('complaint_categories')
      .insert({
        name: data.name,
        description: data.description,
        is_active: true
      })
      .select()
      .single();

    if (catError) throw catError;


    
    return category;
  },

  async toggleCategoryStatus(id: string, is_active: boolean) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('complaint_categories')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
