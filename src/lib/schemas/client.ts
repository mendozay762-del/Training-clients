import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z
    .string()
    .email("Not a valid email")
    .max(200)
    .optional()
    .or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  goalsSummary: z.string().max(2000).optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
