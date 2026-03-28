import { z } from 'zod';

export const createComplaintSchema = z.object({
  category_id: z.string().uuid({ message: 'Kategori harus dipilih' }),
  title: z.string().min(5, { message: 'Judul laporan minimal 5 karakter' }),
  description: z.string().min(10, { message: 'Deskripsi minimal 10 karakter' }),
  location: z.string().min(5, { message: 'Lokasi harus diisi detail' }),
  photo: z.any().optional(), // File upload akan ditangani oleh form
});

export type CreateComplaintFormData = z.infer<typeof createComplaintSchema>;

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional(),
  officer_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type UpdateComplaintStatusFormData = z.infer<typeof updateComplaintStatusSchema>;
