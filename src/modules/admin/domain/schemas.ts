import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(3, "Nama kategori minimal 3 karakter"),
  description: z.string().optional(),
  sla_hours: z.number().min(1, "SLA minimal 1 jam")
});

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
