import { z } from "zod";

export const nutritionFormSchema = z.object({
  clientId: z.string().uuid(),
  noteDate: z.string().optional().or(z.literal("")),
  bodyMd: z.string().min(1, "Note required").max(5000),
});

export type NutritionFormInput = z.infer<typeof nutritionFormSchema>;
