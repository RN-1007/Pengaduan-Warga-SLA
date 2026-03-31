import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://feezcvapudvsabhebgog.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZXpjdmFwdWR2c2FiaGViZ29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxMDgxMywiZXhwIjoyMDg4Nzg2ODEzfQ.ybq9UhrG5XxbvWroFKVUJAal5-_2QPFoasO6aYOBMrs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Testing insert into public.users...");
  const { data, error } = await supabase.from('users').insert({
    id: '123e4567-e89b-12d3-a456-426614174000', // valid UUID
    email: 'test_insert@example.com',
    full_name: 'Test Insert',
    role: 'CITIZEN',
    phone_number: '08123456781'
  }).select();

  if (error) {
    console.error("Error inserting into users:", error);
  } else {
    console.log("Success inserting into users:", data);
  }
}

run()
