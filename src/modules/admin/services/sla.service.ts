import { createClient } from '@/lib/supabase/client'

export const slaService = {
  /** Ambil semua SLA rules beserta nama kategorinya */
  async getSlaRules() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sla_rules')
      .select(`*, complaint_categories ( id, name )`)
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return data || []
  },

  /** Kategori aktif untuk dropdown */
  async getActiveCategories() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('complaint_categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name', { ascending: true })
    if (error) throw new Error(error.message)
    return data || []
  },

  /** Tambah atau update aturan SLA (upsert berdasarkan category_id + priority) */
  async upsertSlaRule(payload: { categoryId: string; priority: string; resolutionTimeHours: number }) {
    const supabase = createClient()
    const { error } = await supabase
      .from('sla_rules')
      .upsert(
        {
          category_id: payload.categoryId,
          priority: payload.priority,
          resolution_time_hours: payload.resolutionTimeHours,
        },
        { onConflict: 'category_id,priority' }
      )
    if (error) throw new Error(error.message)
    return true
  },

  /** Hapus aturan SLA */
  async deleteSlaRule(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('sla_rules').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return true
  },
}
