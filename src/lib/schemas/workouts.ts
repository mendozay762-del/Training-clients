import { z } from "zod";

const optNum = z
  .union([z.number(), z.nan(), z.undefined(), z.null()])
  .transform((v) =>
    typeof v === "number" && !Number.isNaN(v) ? v : undefined,
  );

const optInt = z
  .union([z.number(), z.nan(), z.undefined(), z.null()])
  .transform((v) =>
    typeof v === "number" && !Number.isNaN(v) ? Math.trunc(v) : undefined,
  );

export const startWorkoutSchema = z.object({
  clientId: z.string().uuid(),
  performedOn: z.string().min(1, "Date is required"),
});

export const addExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseName: z.string().trim().min(1, "Name required").max(80),
});

export const setPayloadSchema = z.object({
  reps: z
    .number()
    .int()
    .min(0, "Reps can't be negative")
    .max(999, "That's a lot of reps"),
  weightLbs: optNum,
  rpe: optNum,
  rir: optInt,
  isWarmup: z.boolean().default(false),
});

export type SetPayload = z.input<typeof setPayloadSchema>;
export type SetPayloadParsed = z.output<typeof setPayloadSchema>;

export const endWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const updateWorkoutDateSchema = z.object({
  workoutId: z.string().uuid(),
  performedOn: z.string().min(1, "Date is required"),
});

export function epleyOneRm(
  weightLbs: number | null | undefined,
  reps: number | null | undefined,
): number | null {
  if (
    weightLbs === null ||
    weightLbs === undefined ||
    reps === null ||
    reps === undefined ||
    reps <= 0
  ) {
    return null;
  }
  return weightLbs * (1 + reps / 30);
}
