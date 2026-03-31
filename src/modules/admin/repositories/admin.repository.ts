import { createClient } from '@/lib/supabase/client'
import { CreateCategoryFormData } from '../domain/schemas'
import { ComplaintCategory, SlaRule } from '@/types/database.types'

export const adminRepository = {
  async getCategoriesWithSla() {
    const supabase = createClient();
    // Fetch categories and their SLA rules
    const { data, error } = await supabase
      .from('complaint_categories')
      .select(`
        *,
        sla_rules ( resolution_time_hours )
      `)
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

    // 2. Insert SLA Rules for this category
    const slaRules = [
      { category_id: category.id, priority: 'LOW', resolution_time_hours: data.sla_low || 72 },
      { category_id: category.id, priority: 'MEDIUM', resolution_time_hours: data.sla_medium || 48 },
      { category_id: category.id, priority: 'HIGH', resolution_time_hours: data.sla_high || 24 },
      { category_id: category.id, priority: 'EMERGENCY', resolution_time_hours: data.sla_emergency || 6 },
    ];

    const { error: slaError } = await supabase
      .from('sla_rules')
      .insert(slaRules);

    if (slaError) {
      console.error("Failed to insert SLA rules, but category created.", slaError);
    }
    
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
