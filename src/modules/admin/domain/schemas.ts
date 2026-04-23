import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional(),
  sla_low: z.number().min(1, "Minimal 1 jam"),
  sla_medium: z.number().min(1, "Minimal 1 jam"),
  sla_high: z.number().min(1, "Minimal 1 jam"),
  sla_emergency: z.number().min(1, "Minimal 1 jam"),
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
