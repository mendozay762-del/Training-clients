"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, inArray, isNull, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  prescribedExercises,
  prescribedSets,
  prescribedWorkouts,
  trainingBlocks,
  workoutExercises,
  workoutSets,
  workouts,
} from "@/db/schema";
import {
  createBlockSchema,
  importPasteSchema,
  skipPrescriptionSchema,
  updateBlockSchema,
  updatePrescribedWorkoutSchema,
} from "@/lib/schemas/prescriptions";
import {
  groupRowsToWorkouts,
  parseSheetPaste,
  type SheetParseResult,
} from "@/lib/sheet-import";

function strOrNull(s: string | undefined | null): string | null {
  if (s === undefined || s === null) return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

function numToString(n: number | null | undefined): string | null {
  if (n === undefined || n === null || Number.isNaN(n)) return null;
  return String(n);
}

export async function createBlock(formData: FormData) {
  const parsed = createBlockSchema.parse({
    clientId: formData.get("clientId"),
    name: formData.get("name") ?? "",
    style: formData.get("style") || undefined,
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    weeklySplitSummary: formData.get("weeklySplitSummary") ?? "",
    notes: formData.get("notes") ?? "",
  });

  const [row] = await db
    .insert(trainingBlocks)
    .values({
      clientId: parsed.clientId,
      name: parsed.name,
      style: parsed.style ?? null,
      startDate: parsed.startDate ?? null,
      endDate: parsed.endDate ?? null,
      weeklySplitSummary: strOrNull(parsed.weeklySplitSummary),
      notes: strOrNull(parsed.notes),
    })
    .returning({ id: trainingBlocks.id });

  if (!row) throw new Error("Failed to create block");

  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/program`);
  redirect(`/clients/${parsed.clientId}/program/${row.id}`);
}

export async function updateBlock(
  blockId: string,
  clientId: string,
  formData: FormData,
) {
  const parsed = updateBlockSchema.parse({
    name: formData.get("name") ?? "",
    style: formData.get("style") || undefined,
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
    weeklySplitSummary: formData.get("weeklySplitSummary") ?? "",
    notes: formData.get("notes") ?? "",
    status: formData.get("status") || undefined,
  });

  await db
    .update(trainingBlocks)
    .set({
      name: parsed.name,
      style: parsed.style ?? null,
      startDate: parsed.startDate ?? null,
      endDate: parsed.endDate ?? null,
      weeklySplitSummary: strOrNull(parsed.weeklySplitSummary),
      notes: strOrNull(parsed.notes),
      status: parsed.status ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(trainingBlocks.id, blockId));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
}

export async function setBlockStatus(
  blockId: string,
  clientId: string,
  status: "draft" | "active" | "completed",
) {
  await db
    .update(trainingBlocks)
    .set({ status, updatedAt: new Date() })
    .where(eq(trainingBlocks.id, blockId));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
}

export async function deleteBlock(blockId: string, clientId: string) {
  await db
    .delete(trainingBlocks)
    .where(
      and(eq(trainingBlocks.id, blockId), eq(trainingBlocks.clientId, clientId)),
    );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program`);
}

export type ImportSummary = {
  ok: boolean;
  workoutsCreated: number;
  exercisesCreated: number;
  workoutsReplaced: number;
  errors: SheetParseResult["errors"];
  preview: SheetParseResult["rows"];
};

export async function importFromSheet(
  formData: FormData,
): Promise<ImportSummary> {
  const parsed = importPasteSchema.parse({
    blockId: formData.get("blockId"),
    paste: formData.get("paste") ?? "",
    replaceExisting: formData.get("replaceExisting") === "on",
    mesocycle: formData.get("mesocycle") ?? "",
  });
  const mesocycleLabel = parsed.mesocycle?.trim() || "Mesocycle 1";

  const [block] = await db
    .select({ id: trainingBlocks.id, clientId: trainingBlocks.clientId })
    .from(trainingBlocks)
    .where(eq(trainingBlocks.id, parsed.blockId));
  if (!block) throw new Error("Block not found");

  const result = parseSheetPaste(parsed.paste);

  if (result.errors.length > 0) {
    return {
      ok: false,
      workoutsCreated: 0,
      exercisesCreated: 0,
      workoutsReplaced: 0,
      errors: result.errors,
      preview: result.rows,
    };
  }

  if (result.rows.length === 0) {
    return {
      ok: false,
      workoutsCreated: 0,
      exercisesCreated: 0,
      workoutsReplaced: 0,
      errors: [
        {
          line: 0,
          column: "paste",
          message:
            "No data rows found. Paste must include a header row plus at least one exercise row.",
          raw: "",
        },
      ],
      preview: [],
    };
  }

  const groups = groupRowsToWorkouts(result.rows);
  let replaced = 0;

  if (parsed.replaceExisting) {
    const targetDates = Array.from(
      new Set(groups.map((g) => g.prescribedFor)),
    );
    const existing = await db
      .select({ id: prescribedWorkouts.id })
      .from(prescribedWorkouts)
      .where(
        and(
          eq(prescribedWorkouts.blockId, parsed.blockId),
          inArray(prescribedWorkouts.prescribedFor, targetDates),
          // Never replace a day that has a logged session — protect history.
          isNull(prescribedWorkouts.actualWorkoutId),
        ),
      );
    replaced = existing.length;
    if (existing.length > 0) {
      await db
        .delete(prescribedWorkouts)
        .where(
          inArray(
            prescribedWorkouts.id,
            existing.map((e) => e.id),
          ),
        );
    }
  }

  let workoutsCreated = 0;
  let exercisesCreated = 0;

  for (const group of groups) {
    const [created] = await db
      .insert(prescribedWorkouts)
      .values({
        blockId: parsed.blockId,
        clientId: block.clientId,
        prescribedFor: group.prescribedFor,
        name: group.name,
        mesocycle: mesocycleLabel,
      })
      .returning({ id: prescribedWorkouts.id });
    if (!created) continue;
    workoutsCreated += 1;

    for (let i = 0; i < group.exercises.length; i++) {
      const ex = group.exercises[i];
      const [createdExercise] = await db
        .insert(prescribedExercises)
        .values({
          prescribedWorkoutId: created.id,
          exerciseName: ex.exerciseName,
          orderIndex: i + 1,
          sets: ex.sets,
          repsLow: ex.repsLow,
          repsHigh: ex.repsHigh,
          repsText: ex.repsText,
          loadLbs: numToString(ex.loadLbs),
          loadPct1rm: numToString(ex.loadPct1rm),
          loadText: ex.loadText,
          rpeTarget: numToString(ex.rpeTarget),
          rirTarget: ex.rirTarget,
          rirLow: ex.rirLow,
          rirHigh: ex.rirHigh,
          notes: ex.notes,
        })
        .returning({ id: prescribedExercises.id });
      if (!createdExercise) continue;
      exercisesCreated += 1;

      // Per-set targets so each set can carry its own rep/RIR range.
      if (ex.perSet && ex.perSet.length > 0) {
        await db.insert(prescribedSets).values(
          ex.perSet.map((s) => ({
            prescribedExerciseId: createdExercise.id,
            setIndex: s.setIndex,
            repsLow: s.repsLow,
            repsHigh: s.repsHigh,
            repsText: s.repsText,
            rirLow: s.rirLow,
            rirHigh: s.rirHigh,
          })),
        );
      }
    }
  }

  revalidatePath(`/clients/${block.clientId}`);
  revalidatePath(`/clients/${block.clientId}/program`);
  revalidatePath(`/clients/${block.clientId}/program/${parsed.blockId}`);

  return {
    ok: true,
    workoutsCreated,
    exercisesCreated,
    workoutsReplaced: replaced,
    errors: [],
    preview: result.rows,
  };
}

export async function updatePrescribedWorkout(
  workoutId: string,
  clientId: string,
  blockId: string,
  formData: FormData,
) {
  const parsed = updatePrescribedWorkoutSchema.parse({
    name: formData.get("name") ?? "",
    notes: formData.get("notes") ?? "",
    prescribedFor: formData.get("prescribedFor") ?? "",
  });

  await db
    .update(prescribedWorkouts)
    .set({
      name: strOrNull(parsed.name),
      notes: strOrNull(parsed.notes),
      prescribedFor: parsed.prescribedFor,
      updatedAt: new Date(),
    })
    .where(eq(prescribedWorkouts.id, workoutId));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
  revalidatePath(
    `/clients/${clientId}/program/${blockId}/prescribed/${workoutId}`,
  );
}

export async function deletePrescribedWorkout(
  workoutId: string,
  clientId: string,
  blockId: string,
) {
  // Scoped to the block, and never deletes a day that has a logged session.
  await db
    .delete(prescribedWorkouts)
    .where(
      and(
        eq(prescribedWorkouts.id, workoutId),
        eq(prescribedWorkouts.blockId, blockId),
        isNull(prescribedWorkouts.actualWorkoutId),
      ),
    );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
}

// Bulk-delete prescribed (planned) days — used by "Delete week" and
// "Cut from here." Scoped to the block, and it NEVER deletes a day that has a
// logged session (actualWorkoutId is set), so training history is protected.
export async function deletePrescribedWorkouts(
  clientId: string,
  blockId: string,
  ids: string[],
): Promise<{ deleted: number }> {
  if (ids.length === 0) return { deleted: 0 };

  const removed = await db
    .delete(prescribedWorkouts)
    .where(
      and(
        eq(prescribedWorkouts.blockId, blockId),
        inArray(prescribedWorkouts.id, ids),
        isNull(prescribedWorkouts.actualWorkoutId),
      ),
    )
    .returning({ id: prescribedWorkouts.id });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
  return { deleted: removed.length };
}

// The mesocycle a new day on `date` should join: the mesocycle of the latest
// existing day on or before that date (so it extends the phase it follows);
// falls back to the earliest day's mesocycle, then "Mesocycle 1".
async function mesocycleForDate(
  blockId: string,
  date: string,
): Promise<string> {
  const [before] = await db
    .select({ mesocycle: prescribedWorkouts.mesocycle })
    .from(prescribedWorkouts)
    .where(
      and(
        eq(prescribedWorkouts.blockId, blockId),
        lte(prescribedWorkouts.prescribedFor, date),
      ),
    )
    .orderBy(desc(prescribedWorkouts.prescribedFor))
    .limit(1);
  if (before?.mesocycle) return before.mesocycle;

  const [earliest] = await db
    .select({ mesocycle: prescribedWorkouts.mesocycle })
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.blockId, blockId))
    .orderBy(asc(prescribedWorkouts.prescribedFor))
    .limit(1);
  return earliest?.mesocycle ?? "Mesocycle 1";
}

// Attach a hand-logged workout to a program. If the program already has a
// planned (un-linked) day on that date, connect to it (the logged session
// becomes the real one). Otherwise create a completed day on that date in the
// mesocycle it belongs to. No-op if the workout is already in a program.
export async function addWorkoutToProgram(
  workoutId: string,
  clientId: string,
  blockId: string,
) {
  const [workout] = await db
    .select({
      id: workouts.id,
      clientId: workouts.clientId,
      performedOn: workouts.performedOn,
    })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.clientId, clientId)))
    .limit(1);
  if (!workout) throw new Error("Workout not found");

  const revalidate = () => {
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/program`);
    revalidatePath(`/clients/${clientId}/program/${blockId}`);
    revalidatePath(`/clients/${clientId}/workouts`);
    revalidatePath(`/clients/${clientId}/workouts/${workoutId}`);
  };

  // Already attached to some program? Leave it alone (idempotent).
  const [already] = await db
    .select({ id: prescribedWorkouts.id })
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.actualWorkoutId, workoutId))
    .limit(1);
  if (already) {
    revalidate();
    return;
  }

  // Confirm the target program belongs to this client.
  const [block] = await db
    .select({ id: trainingBlocks.id })
    .from(trainingBlocks)
    .where(
      and(eq(trainingBlocks.id, blockId), eq(trainingBlocks.clientId, clientId)),
    )
    .limit(1);
  if (!block) throw new Error("Program not found");

  // A planned (un-linked) day already on this date? Connect to it.
  const [planned] = await db
    .select({ id: prescribedWorkouts.id })
    .from(prescribedWorkouts)
    .where(
      and(
        eq(prescribedWorkouts.blockId, blockId),
        eq(prescribedWorkouts.prescribedFor, workout.performedOn),
        isNull(prescribedWorkouts.actualWorkoutId),
      ),
    )
    .orderBy(asc(prescribedWorkouts.createdAt))
    .limit(1);

  if (planned) {
    await db
      .update(prescribedWorkouts)
      .set({
        actualWorkoutId: workoutId,
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(prescribedWorkouts.id, planned.id));
  } else {
    const mesocycle = await mesocycleForDate(blockId, workout.performedOn);
    await db.insert(prescribedWorkouts).values({
      blockId,
      clientId,
      prescribedFor: workout.performedOn,
      mesocycle,
      status: "completed",
      actualWorkoutId: workoutId,
    });
  }

  revalidate();
}

export async function skipPrescription(
  workoutId: string,
  clientId: string,
  blockId: string,
  formData: FormData,
) {
  const parsed = skipPrescriptionSchema.parse({
    reason: formData.get("reason") ?? undefined,
  });

  await db
    .update(prescribedWorkouts)
    .set({
      status: "skipped",
      skipReason: parsed.reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(prescribedWorkouts.id, workoutId));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
  revalidatePath(
    `/clients/${clientId}/program/${blockId}/prescribed/${workoutId}`,
  );
}

export async function unskipPrescription(
  workoutId: string,
  clientId: string,
  blockId: string,
) {
  await db
    .update(prescribedWorkouts)
    .set({
      status: "planned",
      skipReason: null,
      updatedAt: new Date(),
    })
    .where(eq(prescribedWorkouts.id, workoutId));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/program/${blockId}`);
  revalidatePath(
    `/clients/${clientId}/program/${blockId}/prescribed/${workoutId}`,
  );
}

export async function startSessionFromPrescription(
  prescribedWorkoutId: string,
) {
  const [prescription] = await db
    .select()
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.id, prescribedWorkoutId));
  if (!prescription) throw new Error("Prescription not found");

  const exercises = await db
    .select()
    .from(prescribedExercises)
    .where(
      eq(prescribedExercises.prescribedWorkoutId, prescribedWorkoutId),
    )
    .orderBy(prescribedExercises.orderIndex);

  if (prescription.actualWorkoutId) {
    redirect(
      `/clients/${prescription.clientId}/workouts/${prescription.actualWorkoutId}`,
    );
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      clientId: prescription.clientId,
      performedOn: prescription.prescribedFor,
    })
    .returning({ id: workouts.id });
  if (!workout) throw new Error("Failed to start session");

  if (exercises.length > 0) {
    const createdExercises = await db
      .insert(workoutExercises)
      .values(
        exercises.map((ex, i) => ({
          workoutId: workout.id,
          exerciseName: ex.exerciseName,
          position: i + 1,
          notes: ex.notes,
        })),
      )
      .returning({ id: workoutExercises.id });

    // Pre-create the prescribed number of empty set rows per exercise so the
    // logged session opens ready to fill in (reps/weight left blank).
    const setRows = createdExercises.flatMap((created, i) => {
      const count = exercises[i]?.sets ?? 0;
      return Array.from({ length: count }, (_, s) => ({
        exerciseId: created.id,
        setIndex: s + 1,
        reps: 0,
      }));
    });

    if (setRows.length > 0) {
      await db.insert(workoutSets).values(setRows);
    }
  }

  await db
    .update(prescribedWorkouts)
    .set({
      status: "completed",
      actualWorkoutId: workout.id,
      updatedAt: new Date(),
    })
    .where(eq(prescribedWorkouts.id, prescribedWorkoutId));

  revalidatePath(`/clients/${prescription.clientId}`);
  revalidatePath(`/clients/${prescription.clientId}/program`);
  revalidatePath(
    `/clients/${prescription.clientId}/program/${prescription.blockId}`,
  );
  redirect(
    `/clients/${prescription.clientId}/workouts/${workout.id}`,
  );
}
