import { z } from 'zod';

// Skema untuk Warga saat membuat pengaduan baru [cite: 7]
export const createComplaintSchema = z.object({
  // Kita gunakan .min(1) sebagai pengganti required_error agar lebih aman dari sisi TypeScript
  category_id: z.string()
    .min(1, "Kategori pengaduan wajib dipilih.")
    .uuid("Format ID kategori tidak valid."),
  
  title: z.string()
    .min(5, "Judul laporan minimal 5 karakter.")
    .max(100, "Judul laporan maksimal 100 karakter."),
    
  description: z.string()
    .min(20, "Deskripsi minimal 20 karakter agar jelas.")
    .max(1000, "Deskripsi terlalu panjang."),
    
  location: z.string()
    .min(5, "Alamat detail/lokasi wajib diisi dengan jelas."),
    
  // Foto bersifat opsional sesuai requirement [cite: 7]
  photo_url: z.string()
    .url("Format URL foto tidak valid.")
    .optional()
    .or(z.literal('')),
});

// Mengekstrak tipe TypeScript dari skema Zod
export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;