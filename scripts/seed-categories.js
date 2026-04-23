const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Infrastruktur - Jalan', description: 'Kerusakan jalan, lubang, aspal rusak.' },
  { name: 'Infrastruktur - Jembatan', description: 'Kerusakan jembatan.' },
  { name: 'Fasilitas Umum', description: 'Masalah fasilitas umum seperti taman, halte, dll.' },
  { name: 'Kebersihan & Sampah', description: 'Masalah kebersihan lingkungan, sampah.' },
  { name: 'Lalu Lintas', description: 'Lampu lalu lintas mati, rambu rusak, dll.' },
  { name: 'Banjir', description: 'Saluran air tersumbat, genangan banjir.' },
  { name: 'Layanan Publik', description: 'Pelayanan aparat, masalah birokrasi pemerintahan.' },
  { name: 'Ketertiban Umum', description: 'Gangguan keamanan, keributan.' },
  { name: 'Lainnya', description: 'Kategori lainnya' }
];

async function run() {
  console.log('Seeding categories...');
  
  for (const cat of categories) {
    const { data: existing } = await supabase
      .from('complaint_categories')
      .select('id')
      .eq('name', cat.name)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabase
        .from('complaint_categories')
        .insert({ name: cat.name, description: cat.description, is_active: true });
        
      if (error) {
        console.error(`Failed to insert ${cat.name}:`, error.message);
      } else {
        console.log(`Inserted: ${cat.name}`);
      }
    } else {
      console.log(`Skipped existing: ${cat.name}`);
    }
  }
  
  console.log('Seeding complete.');
}

run();
