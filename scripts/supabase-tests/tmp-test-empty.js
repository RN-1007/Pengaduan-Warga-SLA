import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://feezcvapudvsabhebgog.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZXpjdmFwdWR2c2FiaGViZ29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxMDgxMywiZXhwIjoyMDg4Nzg2ODEzfQ.ybq9UhrG5XxbvWroFKVUJAal5-_2QPFoasO6aYOBMrs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Testing signUp with NO data...");
  const { data, error } = await supabase.auth.signUp({
    email: 'test_empty@example.com',
    password: 'password123'
  });

  if (error) {
    console.error("signUp Error:", error);
  } else {
    console.log("signUp Success:", data);
  }
}

run()
