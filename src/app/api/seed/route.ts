import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    // Using service role key is recommended for bypassing RLS and creating admin users without email confirmation limits
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const adminEmail = 'admin@pengaduan.com'
    const adminPassword = 'password123'

    const results: any = {
      user: null,
      categories: null,
      message: []
    }

    // 1. Try to create the admin user via Auth Admin (if service role is available)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { full_name: 'Administrator', role: 'ADMIN' }
      })

      if (authError && !authError.message.includes('already exists')) {
        throw new Error(`Failed to create admin user: ${authError.message}`)
      }

      if (authData?.user) {
        // Wait for potential trigger to create public.users record, then update role
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await supabase
          .from('users')
          .update({ role: 'ADMIN', full_name: 'Administrator Utama' })
          .eq('id', authData.user.id);

        results.message.push(`Admin user created: ${adminEmail} / ${adminPassword}`);
      } else {
        results.message.push(`Admin user ${adminEmail} might already exist.`);
      }
    } else {
      // Fallback to regular signup if no service key
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: { full_name: 'Administrator', role: 'ADMIN' }
        }
      })
      
      if (signUpError && !signUpError.message.includes('already registered')) {
        throw new Error(`Signup failed: ${signUpError.message}`)
      }
      
      if (signUpData?.user) {
        // Manually attempt to update role (might fail if RLS blocks it, depends on user setup)
        await supabase
          .from('users')
          .update({ role: 'ADMIN' })
          .eq('id', signUpData.user.id);
          
        results.message.push(`Admin user registered: ${adminEmail} / ${adminPassword}. (Please confirm email if error occurs during login)`);
      } else {
         results.message.push(`Admin user fallback ${adminEmail} might already exist.`);
      }
    }

    // 2. Seed Default Categories
    const defaultCategories = [
      { name: 'Infrastruktur Jalan', description: 'Jalan berlubang, aspal rusak', is_active: true },
      { name: 'Fasilitas Umum', description: 'Taman, trotoar, lampu jalan rusak', is_active: true },
      { name: 'Lingkungan & Sanitasi', description: 'Sampah menumpuk, saluran tersumbat', is_active: true },
      { name: 'Banjir', description: 'Genangan air tinggi, banjir bandang', is_active: true },
    ]

    for (let cat of defaultCategories) {
      // Check if exists
      const { data: existing } = await supabase.from('complaint_categories').select('id').eq('name', cat.name).maybeSingle();
      
      if (!existing) {
        const { data: newCat, error: catError } = await supabase
          .from('complaint_categories')
          .insert(cat)
          .select()
          .single();
          
        if (newCat) {
          // Add default SLA rule 24 hours
          await supabase.from('sla_rules').insert({
            category_id: newCat.id,
            priority: 'MEDIUM',
            resolution_time_hours: 24
          });
        }
      }
    }
    results.message.push('Categories seeded successfully.');

    return NextResponse.json({
      success: true,
      message: "Seeding completed.",
      results
    })
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
