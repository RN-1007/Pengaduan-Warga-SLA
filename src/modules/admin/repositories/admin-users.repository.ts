import { createClient } from "@/lib/supabase/client";

export const adminUsersRepository = {
  async getAllUsers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateUserRole(userId: string, role: string) {
    const res = await fetch('/api/admin/users/role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role })
    });

    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Gagal memperbarui peran melalui API");
    }
    return body.data;
  },

  async deleteUser(userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }
}
