"use server"

import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function deleteUserAndAuthAction(userId: string) {
  const supabase = getAdminSupabase();

  // Delete from Auth first
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  
  if (authError) {
    // If user is just mock data in public.users, auth deletion will fail. 
    // We log it but proceed to clean up the public table anyway.
    console.warn("Auth deletion warning (maybe mock data?):", authError.message);
  }

  // Delete from public.users (manual cascade sync, without altering DB schema)
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
    
  if (dbError) throw new Error(dbError.message);
  
  return true;
}

export async function createUserAndAuthAction(payload: { 
  email: string, 
  password?: string,
  full_name: string, 
  role: string, 
  phone_number?: string 
}) {
  const supabase = getAdminSupabase();

  let formattedPhone = undefined;
  if (payload.phone_number && payload.phone_number.trim() !== '') {
    formattedPhone = payload.phone_number.trim();
    // Konversi bentuk '0812' menjadi valid E.164 standart internasional '+62812' 
    // agar diterima oleh kolom 'phone' Supabase Auth utama
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+62' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone; 
    }
  }

  const authPayload: any = {
    email: payload.email,
    password: payload.password || 'Password123!', // Gunakan password kustom atau fallback
    email_confirm: true,
    user_metadata: {
      full_name: payload.full_name,
      phone_number: payload.phone_number || null,
      role: payload.role
    }
  };

  if (formattedPhone) {
    authPayload.phone = formattedPhone;
    authPayload.phone_confirm = true;
  }

  const { data: authData, error: authError } = await supabase.auth.admin.createUser(authPayload);

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error("Gagal membuat user autentikasi!");

  const { error: dbError } = await supabase
    .from('users')
    .upsert(
      {
        id: authData.user.id,
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role,
        phone_number: payload.phone_number || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (dbError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(dbError.message);
  }

  return authData.user;
}

export async function editUserAction(userId: string, payload: {
  full_name?: string;
  phone_number?: string;
  role?: string;
  password?: string;
}) {
  const supabase = getAdminSupabase();

  let formattedPhone = undefined;
  if (payload.phone_number && payload.phone_number.trim() !== '') {
    formattedPhone = payload.phone_number.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+62' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone; 
    }
  }

  // 1. Update Auth Metadata (dan password serta phone jika diisi)
  const authUpdatePayload: any = {
    user_metadata: {
      full_name: payload.full_name,
      phone_number: payload.phone_number || null,
      role: payload.role
    }
  };

  if (formattedPhone) {
    authUpdatePayload.phone = formattedPhone;
    authUpdatePayload.phone_confirm = true;
  }

  if (payload.password) {
    authUpdatePayload.password = payload.password;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdatePayload);

  if (authError) {
    console.warn("Gagal update metadata Auth:", authError.message);
    throw new Error(authError.message);
  }

  // 2. Update Public Users table
  const dbUpdatePayload: any = {
    updated_at: new Date().toISOString()
  };
  if (payload.full_name) dbUpdatePayload.full_name = payload.full_name;
  if (payload.phone_number !== undefined) dbUpdatePayload.phone_number = payload.phone_number || null;
  if (payload.role) dbUpdatePayload.role = payload.role;

  const { error: dbError } = await supabase
    .from('users')
    .update(dbUpdatePayload)
    .eq('id', userId);

  if (dbError) throw new Error(dbError.message);

  return true;
}
