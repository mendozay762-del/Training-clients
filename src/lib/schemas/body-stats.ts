import { z } from "zod";

export const bodyStatsFormSchema = z.object({
  clientId: z.string().uuid(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Bad date"),
  weightLbs: z.coerce.number().positive().max(1500).optional().or(z.nan()),
  sleepHoursAvg: z.coerce
    .number()
    .min(0)
    .max(24)
    .optional()
    .or(z.nan()),
  wellness: z.coerce
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .or(z.nan()),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type BodyStatsFormInput = z.infer<typeof bodyStatsFormSchema>;
