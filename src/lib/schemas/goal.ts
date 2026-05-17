import { z } from "zod";

export const goalFormSchema = z.object({
  clientId: z.string().uuid(),
  body: z.string().min(1, "Goal text required").max(500),
  targetDate: z.string().optional().or(z.literal("")),
});

export type GoalFormInput = z.infer<typeof goalFormSchema>;
