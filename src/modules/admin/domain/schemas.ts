import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional()
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
