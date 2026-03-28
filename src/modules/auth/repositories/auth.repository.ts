import { createClient } from '@/lib/supabase/client'
import { RegisterFormData, LoginFormData } from '../domain/schemas'

export const authRepository = {
  async register(data: RegisterFormData) {
    const supabase = createClient();
    
    // Supabase Auth Register
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone_number: data.phone_number,
          role: 'CITIZEN' // Default role
        }
      }
    });

    if (authError) throw authError;

    return authData;
  },

  async login(data: LoginFormData) {
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;
    return authData;
  },

  async logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) return null;

    // Fetch extended user details from public.users table (role, etc)
    // We check by email just in case the user manually inserted a row in Supabase Studio with a mismatched UUID
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile && user.email) {
      const { data: profileByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
        
      if (profileByEmail) profile = profileByEmail;
    }

    const metaRole = user.user_metadata?.role || user.app_metadata?.role;

    if (profileError || !profile) {
      // If error or profile missing (e.g., user created manually in Supabase Auth UI without a DB trigger)
      console.warn("Profile not found or error, falling back to Metadata Role or Citizen");
      return { 
        ...user, 
        profile: { 
          role: metaRole || 'CITIZEN', 
          full_name: user.user_metadata?.full_name || user.email || 'User' 
        } 
      };
    }

    // Trust metadata role if it's explicitly set to ADMIN in the Supabase Auth Dashboard
    const finalRole = metaRole === 'ADMIN' ? 'ADMIN' : (profile.role || 'CITIZEN');

    return { ...user, profile: { ...profile, role: finalRole } };
  }
}
