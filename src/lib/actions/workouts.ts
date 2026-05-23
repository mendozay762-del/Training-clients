"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, max } from "drizzle-orm";
import { db } from "@/db";
import {
  workouts,
  workoutExercises,
  workoutSets,
  prescribedWorkouts,
} from "@/db/schema";
import {
  addExerciseSchema,
  endWorkoutSchema,
  setPayloadSchema,
  startWorkoutSchema,
  updateWorkoutDateSchema,
} from "@/lib/schemas/workouts";

function numericOrNull(v: number | undefined): string | null {
  if (v === undefined || Number.isNaN(v)) return null;
  return String(v);
}

export async function startWorkout(formData: FormData) {
  const parsed = startWorkoutSchema.parse({
    clientId: formData.get("clientId"),
    performedOn: formData.get("performedOn") ?? "",
  });

  const [workout] = await db
    .insert(workouts)
    .values({
      clientId: parsed.clientId,
      performedOn: parsed.performedOn,
    })
    .returning({ id: workouts.id });

  if (!workout) {
    throw new Error("Failed to start workout");
  }

  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/workouts`);
  redirect(`/clients/${parsed.clientId}/workouts/${workout.id}`);
}

export async function addExercise(formData: FormData) {
  const parsed = addExerciseSchema.parse({
    workoutId: formData.get("workoutId"),
    exerciseName: formData.get("exerciseName") ?? "",
  });

  const [nextPos] = await db
    .select({ value: max(workoutExercises.position) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, parsed.workoutId));

  const position = (nextPos?.value ?? 0) + 1;

  const [created] = await db
    .insert(workoutExercises)
    .values({
      workoutId: parsed.workoutId,
      exerciseName: parsed.exerciseName,
      position,
    })
    .returning({ id: workoutExercises.id });

  if (!created) throw new Error("Failed to add exercise");

  const [parent] = await db
    .select({ clientId: workouts.clientId })
    .from(workouts)
    .where(eq(workouts.id, parsed.workoutId));

  if (parent) {
    revalidatePath(
      `/clients/${parent.clientId}/workouts/${parsed.workoutId}`,
    );
  }
  return created.id;
}

export async function deleteExercise(
  exerciseId: string,
  workoutId: string,
  clientId: string,
) {
  await db.delete(workoutExercises).where(eq(workoutExercises.id, exerciseId));
  revalidatePath(`/clients/${clientId}/workouts/${workoutId}`);
}

export async function addSet(formData: FormData) {
  const exerciseId = String(formData.get("exerciseId") ?? "");
  if (!exerciseId) throw new Error("Missing exerciseId");

  const payload = setPayloadSchema.parse({
    reps: Number(formData.get("reps") ?? NaN),
    weightLbs: parseOpt(formData.get("weightLbs")),
    rpe: parseOpt(formData.get("rpe")),
    rir: parseOpt(formData.get("rir")),
    isWarmup: formData.get("isWarmup") === "true",
  });

  const [nextIdx] = await db
    .select({ value: max(workoutSets.setIndex) })
    .from(workoutSets)
    .where(eq(workoutSets.exerciseId, exerciseId));

  const setIndex = (nextIdx?.value ?? 0) + 1;

  await db.insert(workoutSets).values({
    exerciseId,
    setIndex,
    reps: payload.reps,
    weightLbs: numericOrNull(payload.weightLbs),
    rpe: numericOrNull(payload.rpe),
    rir: payload.rir ?? null,
    isWarmup: payload.isWarmup,
  });

  await revalidateForExercise(exerciseId);
}

export async function updateSet(formData: FormData) {
  const setId = String(formData.get("setId") ?? "");
  if (!setId) throw new Error("Missing setId");

  const payload = setPayloadSchema.parse({
    reps: Number(formData.get("reps") ?? NaN),
    weightLbs: parseOpt(formData.get("weightLbs")),
    rpe: parseOpt(formData.get("rpe")),
    rir: parseOpt(formData.get("rir")),
    isWarmup: formData.get("isWarmup") === "true",
  });

  await db
    .update(workoutSets)
    .set({
      reps: payload.reps,
      weightLbs: numericOrNull(payload.weightLbs),
      rpe: numericOrNull(payload.rpe),
      rir: payload.rir ?? null,
      isWarmup: payload.isWarmup,
    })
    .where(eq(workoutSets.id, setId));

  const [row] = await db
    .select({ exerciseId: workoutSets.exerciseId })
    .from(workoutSets)
    .where(eq(workoutSets.id, setId));

  if (row) await revalidateForExercise(row.exerciseId);
}

export async function deleteSet(setId: string) {
  const [row] = await db
    .select({ exerciseId: workoutSets.exerciseId })
    .from(workoutSets)
    .where(eq(workoutSets.id, setId));

  await db.delete(workoutSets).where(eq(workoutSets.id, setId));

  if (row) await revalidateForExercise(row.exerciseId);
}

export async function endWorkout(formData: FormData) {
  const parsed = endWorkoutSchema.parse({
    workoutId: formData.get("workoutId"),
    notes: formData.get("notes") ?? "",
  });

  await db
    .update(workouts)
    .set({
      notes: parsed.notes && parsed.notes.length > 0 ? parsed.notes : null,
      updatedAt: new Date(),
    })
    .where(eq(workouts.id, parsed.workoutId));

  const [parent] = await db
    .select({ clientId: workouts.clientId })
    .from(workouts)
    .where(eq(workouts.id, parsed.workoutId));

  if (parent) {
    revalidatePath(`/clients/${parent.clientId}`);
    revalidatePath(`/clients/${parent.clientId}/workouts`);
    revalidatePath(
      `/clients/${parent.clientId}/workouts/${parsed.workoutId}`,
    );
  }
}

export async function updateWorkoutDate(formData: FormData) {
  const parsed = updateWorkoutDateSchema.parse({
    workoutId: formData.get("workoutId"),
    performedOn: formData.get("performedOn") ?? "",
  });

  await db
    .update(workouts)
    .set({ performedOn: parsed.performedOn, updatedAt: new Date() })
    .where(eq(workouts.id, parsed.workoutId));

  const [parent] = await db
    .select({ clientId: workouts.clientId })
    .from(workouts)
    .where(eq(workouts.id, parsed.workoutId));

  if (parent) {
    revalidatePath(`/clients/${parent.clientId}`);
    revalidatePath(`/clients/${parent.clientId}/workouts`);
    revalidatePath(
      `/clients/${parent.clientId}/workouts/${parsed.workoutId}`,
    );
  }
}

export async function deleteWorkout(workoutId: string, clientId: string) {
  // Unlink any prescription pointing at this workout so it doesn't stay
  // marked "completed" with a dangling link.
  await db
    .update(prescribedWorkouts)
    .set({ status: "planned", actualWorkoutId: null, updatedAt: new Date() })
    .where(eq(prescribedWorkouts.actualWorkoutId, workoutId));

  await db.delete(workouts).where(
    and(eq(workouts.id, workoutId), eq(workouts.clientId, clientId)),
  );
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program`);
  revalidatePath(`/clients/${clientId}/workouts`);
}

function parseOpt(raw: FormDataEntryValue | null): number | undefined {
  if (raw === null) return undefined;
  const s = String(raw).trim();
  if (s === "") return undefined;
  const n = Number(s);
  if (Number.isNaN(n)) return undefined;
  return n;
}

async function revalidateForExercise(exerciseId: string) {
  const [row] = await db
    .select({
      workoutId: workoutExercises.workoutId,
      clientId: workouts.clientId,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(workoutExercises.id, exerciseId));

  if (row) {
    revalidatePath(
      `/clients/${row.clientId}/workouts/${row.workoutId}`,
    );
    revalidatePath(`/clients/${row.clientId}`);
    revalidatePath(`/clients/${row.clientId}/workouts`);
  }
}

