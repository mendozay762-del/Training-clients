"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, clientIntake, bodyStats } from "@/db/schema";
import {
  intakeFormSchema,
  type IntakeFormData,
  type IntakeFormParsed,
} from "@/lib/schemas/client-intake";

function isoMondayOf(d: Date): string {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  return date.toISOString().slice(0, 10);
}

function numericOrNull(v: number | undefined): string | null {
  if (v === undefined || Number.isNaN(v)) return null;
  return String(v);
}

type ActionResult =
  | { ok: true; clientId: string }
  | { ok: false; error: string };

function clientValuesFromForm(parsed: IntakeFormParsed) {
  return {
    name: parsed.name,
    preferredName: parsed.preferredName ?? null,
    dateOfBirth: parsed.dateOfBirth || null,
    email: parsed.email ?? null,
    phone: parsed.phone ?? null,
    city: parsed.city ?? null,
    state: parsed.state ?? null,
    address: parsed.address ?? null,
    coachingType: parsed.coachingType,
    referralSource: parsed.referralSource ?? null,
    targetStartDate: parsed.targetStartDate || null,
    budgetRange: parsed.budgetRange ?? null,
    commPreference: parsed.commPreference?.length ? parsed.commPreference : null,
    commPreferenceOther: parsed.commPreferenceOther ?? null,
    commPreferenceHandle: parsed.commPreferenceHandle ?? null,
  };
}

function intakeValuesFromForm(parsed: IntakeFormParsed) {
  return {
    emergencyName: parsed.emergencyName ?? null,
    emergencyRelationship: parsed.emergencyRelationship ?? null,
    emergencyPhone: parsed.emergencyPhone ?? null,
    preferredGymLocation: parsed.preferredGymLocation ?? null,
    maxTravelDistance: parsed.maxTravelDistance ?? null,
    gymAccess: parsed.gymAccess?.length ? parsed.gymAccess : null,
    equipmentAvailable: parsed.equipmentAvailable ?? null,
    daysPerWeek: parsed.daysPerWeek?.length ? parsed.daysPerWeek : null,
    sessionLengthMin: parsed.sessionLengthMin?.length ? parsed.sessionLengthMin : null,
    preferredTimeOfDay: parsed.preferredTimeOfDay ?? null,
    primaryGoal: parsed.primaryGoal ?? null,
    primaryGoalOther: parsed.primaryGoalOther ?? null,
    secondaryGoal: parsed.secondaryGoal ?? null,
    goalReason: parsed.goalReason ?? null,
    goalTimeline: parsed.goalTimeline ?? null,
    goalTimelineOther: parsed.goalTimelineOther ?? null,
    measureProgress: parsed.measureProgress ?? [],
    measureProgressOther: parsed.measureProgressOther ?? null,
    commitmentLevel: parsed.commitmentLevel ?? null,
    activityLevel: parsed.activityLevel ?? null,
    yearsExperience: parsed.yearsExperience ?? null,
    currentlyTraining: parsed.currentlyTraining ?? null,
    currentTrainingDays: parsed.currentTrainingDays ?? null,
    currentProgram: parsed.currentProgram ?? null,
    currentProgramDuration: parsed.currentProgramDuration ?? null,
    workedWithTrainer: parsed.workedWithTrainer ?? null,
    trainerLiked: parsed.trainerLiked ?? null,
    trainerDisliked: parsed.trainerDisliked ?? null,
    exercisesEnjoy: parsed.exercisesEnjoy ?? null,
    exercisesAvoid: parsed.exercisesAvoid ?? null,
    squatLbs: numericOrNull(parsed.squatLbs),
    benchLbs: numericOrNull(parsed.benchLbs),
    deadliftLbs: numericOrNull(parsed.deadliftLbs),
    ohpLbs: numericOrNull(parsed.ohpLbs),
    rowLbs: numericOrNull(parsed.rowLbs),
    nonNegotiableMovements: parsed.nonNegotiableMovements ?? null,
    preLiftRoutine: parsed.preLiftRoutine ?? null,
    splitPreference: parsed.splitPreference?.length ? parsed.splitPreference : null,
    proximityToFailure: parsed.proximityToFailure ?? null,
    parqHeartCondition: parsed.parqHeartCondition ?? null,
    parqChestPainActive: parsed.parqChestPainActive ?? null,
    parqChestPainRest: parsed.parqChestPainRest ?? null,
    parqDizziness: parsed.parqDizziness ?? null,
    parqBoneJoint: parsed.parqBoneJoint ?? null,
    parqBpHeartMeds: parsed.parqBpHeartMeds ?? null,
    parqOtherReason: parsed.parqOtherReason ?? null,
    medicalConditions: parsed.medicalConditions ?? null,
    medications: parsed.medications ?? null,
    surgeries5yr: parsed.surgeries5yr ?? null,
    pastInjuries: parsed.pastInjuries ?? null,
    currentPain: parsed.currentPain ?? null,
    doctorCleared: parsed.doctorCleared ?? null,
    sleepHours: numericOrNull(parsed.sleepHours),
    sleepQuality: parsed.sleepQuality ?? null,
    stressLevel: parsed.stressLevel ?? null,
    workActivity: parsed.workActivity?.length ? parsed.workActivity : null,
    workSchedule: parsed.workSchedule ?? null,
    outsideCommitments: parsed.outsideCommitments ?? null,
    dietaryPattern: parsed.dietaryPattern?.length ? parsed.dietaryPattern : null,
    dietaryPatternOther: parsed.dietaryPatternOther ?? null,
    foodAllergies: parsed.foodAllergies ?? null,
    dietaryRestrictions: parsed.dietaryRestrictions ?? null,
    typicalDayFood: parsed.typicalDayFood ?? null,
    waterPerDay: parsed.waterPerDay ?? null,
    alcoholPerWeek: numericOrNull(parsed.alcoholPerWeek),
    caffeinePerDay: parsed.caffeinePerDay ?? null,
    supplements: parsed.supplements ?? null,
    biggestNutritionChallenge: parsed.biggestNutritionChallenge ?? null,
    anythingElse: parsed.anythingElse ?? null,
    sharesMeasurements: parsed.sharesMeasurements,
    acknowledgedName: parsed.acknowledgedName ?? null,
  };
}

export async function createClientFromIntake(
  raw: IntakeFormData,
): Promise<ActionResult> {
  let parsed: IntakeFormParsed;
  try {
    parsed = intakeFormSchema.parse(raw);
  } catch (e) {
    console.error("createClientFromIntake validation failed", e);
    return {
      ok: false,
      error: "Some answers look invalid. Please review the highlighted fields and try again.",
    };
  }

  try {
    const [client] = await db
      .insert(clients)
      .values({ ...clientValuesFromForm(parsed), active: true })
      .returning({ id: clients.id });

    if (!client) {
      return { ok: false, error: "Failed to create client" };
    }

    await db.insert(clientIntake).values({
      clientId: client.id,
      ...intakeValuesFromForm(parsed),
      acknowledgedAt: parsed.acknowledgedName ? new Date() : null,
    });

    const hasMeasurements =
      parsed.sharesMeasurements &&
      (parsed.weightLbs !== undefined ||
        parsed.waistIn !== undefined ||
        parsed.chestIn !== undefined ||
        parsed.hipsIn !== undefined);

    if (hasMeasurements) {
      await db.insert(bodyStats).values({
        clientId: client.id,
        weekStart: isoMondayOf(new Date()),
        weightLbs: numericOrNull(parsed.weightLbs),
        waistIn: numericOrNull(parsed.waistIn),
        chestIn: numericOrNull(parsed.chestIn),
        hipsIn: numericOrNull(parsed.hipsIn),
        sleepHoursAvg: numericOrNull(parsed.sleepHours),
      });
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${client.id}`);

    return { ok: true, clientId: client.id };
  } catch (e) {
    console.error("createClientFromIntake failed", e);
    return {
      ok: false,
      error: "Couldn't save this client. Please try again — if it keeps failing, check your internet connection.",
    };
  }
}

export async function updateClientFromIntake(
  clientId: string,
  raw: IntakeFormData,
): Promise<ActionResult> {
  let parsed: IntakeFormParsed;
  try {
    parsed = intakeFormSchema.parse(raw);
  } catch (e) {
    console.error("updateClientFromIntake validation failed", e);
    return {
      ok: false,
      error: "Some answers look invalid. Please review and try again.",
    };
  }

  try {
    const updated = await db
      .update(clients)
      .set({ ...clientValuesFromForm(parsed), updatedAt: new Date() })
      .where(eq(clients.id, clientId))
      .returning({ id: clients.id });

    if (updated.length === 0) {
      return { ok: false, error: "Client not found." };
    }

    const existing = await db
      .select({ id: clientIntake.id, acknowledgedAt: clientIntake.acknowledgedAt })
      .from(clientIntake)
      .where(eq(clientIntake.clientId, clientId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(clientIntake)
        .set({
          ...intakeValuesFromForm(parsed),
          acknowledgedAt:
            existing[0].acknowledgedAt ??
            (parsed.acknowledgedName ? new Date() : null),
          updatedAt: new Date(),
        })
        .where(eq(clientIntake.clientId, clientId));
    } else {
      await db.insert(clientIntake).values({
        clientId,
        ...intakeValuesFromForm(parsed),
        acknowledgedAt: parsed.acknowledgedName ? new Date() : null,
      });
    }

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath(`/clients/${clientId}/intake/edit`);

    return { ok: true, clientId };
  } catch (e) {
    console.error("updateClientFromIntake failed", e);
    return {
      ok: false,
      error: "Couldn't save these changes. Please try again — if it keeps failing, check your internet connection.",
    };
  }
}
