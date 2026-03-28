import { z } from "zod";

export const createRatingSchema = z.object({
  score: z.number().min(1, "Minimal rating 1 bintang").max(5, "Maksimal rating 5 bintang"),
  feedback: z.string().optional(),
});

export type CreateRatingFormData = z.infer<typeof createRatingSchema>;
