import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Error Server: Variabel SUPABASE_SERVICE_ROLE_KEY belum ditambahkan ke .env.local Anda. Kebijakan Keamanan RLS tidak dapat di-bypass." }, 
        { status: 500 }
      );
    }

    // Menggunakan service role key akan mem-bypass RLS (Row Level Security) 
    // secara aman dari sisi Server (Backend).
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
