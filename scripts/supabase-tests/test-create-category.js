import { createClient } from '@supabase/supabase-js'
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
// Let's use service_role to see if it bypasses RLS and works, or if there's a schema error.
const tempKeyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(
  urlMatch ? urlMatch[1].trim() : 'https://feezcvapudvsabhebgog.supabase.co', 
  keyMatch ? keyMatch[1].trim() : ''
)

async function testCreate() {
  console.log("Testing insert category...");
  const { data: category, error: catError } = await supabase
    .from('complaint_categories')
    .insert({
      name: "Test API Category",
      description: "Testing from script",
      is_active: true
    })
    .select()
    .single();

  if (catError) {
    console.error("Category Insert Error:", catError);
    return;
  }
  console.log("Category created:", category);

  const slaRules = [
    { category_id: category.id, priority: 'LOW', resolution_time_hours: 72 },
    { category_id: category.id, priority: 'MEDIUM', resolution_time_hours: 48 },
    { category_id: category.id, priority: 'HIGH', resolution_time_hours: 24 },
    { category_id: category.id, priority: 'EMERGENCY', resolution_time_hours: 6 },
  ];

  const { data: rules, error: slaError } = await supabase
    .from('sla_rules')
    .insert(slaRules)
    .select();

  if (slaError) {
    console.error("SLA Insert Error:", slaError);
  } else {
    console.log("SLA Rules created:", rules);
  }
}

testCreate();
