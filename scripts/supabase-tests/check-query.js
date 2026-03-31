import { createClient } from '@supabase/supabase-js'
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabase = createClient(
  urlMatch ? urlMatch[1].trim() : 'https://feezcvapudvsabhebgog.supabase.co', 
  keyMatch ? keyMatch[1].trim() : ''
)

async function run() {
  const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        complaint_updates (
           *,
           users (full_name)
        )
      `)
      .limit(1)
      .single();

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Success:", data);
  }
}

run()
