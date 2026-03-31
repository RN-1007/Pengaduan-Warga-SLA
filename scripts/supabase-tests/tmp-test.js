import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://feezcvapudvsabhebgog.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlZXpjdmFwdWR2c2FiaGViZ29nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIxMDgxMywiZXhwIjoyMDg4Nzg2ODEzfQ.ybq9UhrG5XxbvWroFKVUJAal5-_2QPFoasO6aYOBMrs'

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log("Testing register...");
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'test_register_error@example.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: {
      full_name: 'Test',
      phone_number: '08123456789',
      role: 'CITIZEN'
    }
  });

  if (error) {
    console.error("Error from admin.createUser:", error);
  } else {
    console.log("Success with admin.createUser:", data);
  }

  // Next, try normal signup
  console.log("\nTesting normal signup...");
  const authClient = createClient(supabaseUrl, 'ey...anon...'); // wait I need the real anon key from env.local
}

// Just extract the anon key
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const anonKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
const anonKey = anonKeyMatch ? anonKeyMatch[1].trim() : '';

const normalApp = createClient(supabaseUrl, anonKey);

async function normalRegister() {
  const { data, error } = await normalApp.auth.signUp({
    email: 'test_normal_register@example.com',
    password: 'password123!',
    options: {
      data: {
        full_name: 'Test Normal',
        phone_number: '08123456789',
        role: 'CITIZEN'
      }
    }
  });

  if (error) {
    console.error("Error from auth.signUp:", error.message, error);
  } else {
    console.log("Success with auth.signUp:", data);
  }
}

normalRegister().catch(console.error);

