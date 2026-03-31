import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://feezcvapudvsabhebgog.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZXpjdmFwdWR2c2FiaGViZ29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxMDgxMywiZXhwIjoyMDg4Nzg2ODEzfQ.ybq9UhrG5XxbvWroFKVUJAal5-_2QPFoasO6aYOBMrs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Testing create user with ALL possible metadata fields...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_all_meta@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      name: 'Test Name',
      full_name: 'Test Full Name',
      phone: '08123456780',
      phone_number: '08123456789',
      role: 'CITIZEN',
      user_role: 'CITIZEN',
      avatar_url: ''
    }
  });

  if (error) {
    console.error("Error from admin.createUser:", error);
  } else {
    console.log("Success with admin.createUser:", data);
  }
}

run()
