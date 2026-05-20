import { z } from "zod";

export const BLOCK_STYLES = [
  "hypertrophy",
  "strength",
  "endurance",
  "cardio",
  "hybrid",
  "other",
] as const;

export type BlockStyle = (typeof BLOCK_STYLES)[number];

export const BLOCK_STYLE_LABELS: Record<BlockStyle, string> = {
  hypertrophy: "Hypertrophy",
  strength: "Strength",
  endurance: "Endurance",
  cardio: "Cardio",
  hybrid: "Hybrid",
  other: "Other",
};

export const BLOCK_STATUSES = ["draft", "active", "completed"] as const;
export type BlockStatus = (typeof BLOCK_STATUSES)[number];

export const PRESCRIBED_STATUSES = [
  "planned",
  "completed",
  "skipped",
] as const;
export type PrescribedStatus = (typeof PRESCRIBED_STATUSES)[number];

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalDate = z.preprocess(
  emptyToUndef,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD").optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    emptyToUndef,
    z.string().trim().max(max).optional(),
  );

export const createBlockSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required").max(80),
  style: z.enum(BLOCK_STYLES).optional(),
  startDate: optionalDate,
  endDate: optionalDate,
  weeklySplitSummary: optionalText(200),
  notes: optionalText(2000),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;

export const updateBlockSchema = createBlockSchema
  .omit({ clientId: true })
  .extend({
    status: z.enum(BLOCK_STATUSES).optional(),
  });

export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;

export const importPasteSchema = z.object({
  blockId: z.string().uuid(),
  paste: z.string().min(1, "Paste your sheet contents first"),
  replaceExisting: z.boolean().default(false),
});

export type ImportPasteInput = z.infer<typeof importPasteSchema>;

export const updatePrescribedWorkoutSchema = z.object({
  name: optionalText(80),
  notes: optionalText(2000),
  prescribedFor: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

export type UpdatePrescribedWorkoutInput = z.infer<
  typeof updatePrescribedWorkoutSchema
>;

export const skipPrescriptionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});
