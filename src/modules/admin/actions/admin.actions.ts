"use server";

import { createClient } from '@supabase/supabase-js';
import { CreateCategoryFormData } from '../domain/schemas';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

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
    .select(`*`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function deleteCategoryAction(id: string) {
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from('complaint_categories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function editCategoryAction(id: string, data: Pick<CreateCategoryFormData, 'name' | 'description'>) {
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
  return updated;
}
