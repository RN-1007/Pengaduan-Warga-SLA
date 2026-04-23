"use server";

import { createClient } from '@supabase/supabase-js';
import { CreateCategoryFormData } from '../domain/schemas';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

async function upsertSlaRules(supabase: ReturnType<typeof getAdminSupabase>, categoryId: string, data: CreateCategoryFormData) {
  // Hapus rules lama
  await supabase.from('sla_rules').delete().eq('category_id', categoryId);

  // Sisipkan rules baru
  const rules = [
    { category_id: categoryId, priority: 'LOW', resolution_time_hours: data.sla_low },
    { category_id: categoryId, priority: 'MEDIUM', resolution_time_hours: data.sla_medium },
    { category_id: categoryId, priority: 'HIGH', resolution_time_hours: data.sla_high },
    { category_id: categoryId, priority: 'EMERGENCY', resolution_time_hours: data.sla_emergency },
  ];

  const { error } = await supabase.from('sla_rules').insert(rules);
  if (error) throw new Error(error.message);
}

export async function createCategoryAction(data: CreateCategoryFormData) {
  const supabase = getAdminSupabase();

  // 1. Insert Category
  const { data: category, error: catError } = await supabase
    .from('complaint_categories')
    .insert({
      name: data.name,
      description: data.description,
      is_active: true,
    })
    .select()
    .single();

  if (catError) {
    throw new Error(catError.message);
  }

  // 2. Insert SLA Rules
  await upsertSlaRules(supabase, category.id, data);

  return category;
}

export async function toggleCategoryAction(id: string, is_active: boolean) {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaint_categories')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getCategoriesAction() {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from('complaint_categories')
    .select(`*, sla_rules ( priority, resolution_time_hours )`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function deleteCategoryAction(id: string) {
  const supabase = getAdminSupabase();
  
  // Hapus SLA rules terkait dulu
  await supabase.from('sla_rules').delete().eq('category_id', id);
  
  const { error } = await supabase
    .from('complaint_categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function editCategoryAction(id: string, data: CreateCategoryFormData) {
  const supabase = getAdminSupabase();
  const { data: updated, error } = await supabase
    .from('complaint_categories')
    .update({ 
      name: data.name, 
      description: data.description 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Update SLA rules
  await upsertSlaRules(supabase, id, data);

  return updated;
}
