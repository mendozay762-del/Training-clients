import type { Client, ClientIntake } from "@/db/schema";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

function parseNum(v: string | null | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

type IntakeRow = ClientIntake | undefined;

export function formDefaultsFromDb(
  client: Client,
  intake: IntakeRow,
): Partial<IntakeFormData> {
  return {
    // clients table
    name: client.name,
    preferredName: client.preferredName ?? undefined,
    dateOfBirth: client.dateOfBirth ?? undefined,
    email: client.email ?? undefined,
    phone: client.phone ?? undefined,
    city: client.city ?? undefined,
    state: client.state ?? undefined,
    address: client.address ?? undefined,
    coachingType: (client.coachingType ?? "in_person") as IntakeFormData["coachingType"],
    referralSource: client.referralSource ?? undefined,
    targetStartDate: client.targetStartDate ?? undefined,
    budgetRange: client.budgetRange ?? undefined,
    commPreference:
      (client.commPreference as IntakeFormData["commPreference"] | null) ?? [],
    commPreferenceOther: client.commPreferenceOther ?? undefined,
    commPreferenceHandle: client.commPreferenceHandle ?? undefined,

    // client_intake table
    emergencyName: intake?.emergencyName ?? undefined,
    emergencyRelationship: intake?.emergencyRelationship ?? undefined,
    emergencyPhone: intake?.emergencyPhone ?? undefined,
    preferredGymLocation: intake?.preferredGymLocation ?? undefined,
    maxTravelDistance: intake?.maxTravelDistance ?? undefined,
    gymAccess: (intake?.gymAccess as IntakeFormData["gymAccess"] | null) ?? [],
    equipmentAvailable: intake?.equipmentAvailable ?? undefined,
    daysPerWeek: (intake?.daysPerWeek as number[] | null) ?? [],
    sessionLengthMin: (intake?.sessionLengthMin as number[] | null) ?? [],
    preferredTimeOfDay: intake?.preferredTimeOfDay ?? undefined,

    primaryGoal: (intake?.primaryGoal as IntakeFormData["primaryGoal"]) ?? undefined,
    primaryGoalOther: intake?.primaryGoalOther ?? undefined,
    secondaryGoal: intake?.secondaryGoal ?? undefined,
    goalReason: intake?.goalReason ?? undefined,
    goalTimeline: (intake?.goalTimeline as IntakeFormData["goalTimeline"]) ?? undefined,
    goalTimelineOther: intake?.goalTimelineOther ?? undefined,
    measureProgress:
      (intake?.measureProgress as IntakeFormData["measureProgress"] | null) ?? [],
    measureProgressOther: intake?.measureProgressOther ?? undefined,
    commitmentLevel: intake?.commitmentLevel ?? undefined,

    activityLevel: (intake?.activityLevel as IntakeFormData["activityLevel"]) ?? undefined,
    yearsExperience: (intake?.yearsExperience as IntakeFormData["yearsExperience"]) ?? undefined,
    currentlyTraining: intake?.currentlyTraining ?? undefined,
    currentTrainingDays: intake?.currentTrainingDays ?? undefined,
    currentProgram: intake?.currentProgram ?? undefined,
    currentProgramDuration: intake?.currentProgramDuration ?? undefined,
    workedWithTrainer: intake?.workedWithTrainer ?? undefined,
    trainerLiked: intake?.trainerLiked ?? undefined,
    trainerDisliked: intake?.trainerDisliked ?? undefined,
    exercisesEnjoy: intake?.exercisesEnjoy ?? undefined,
    exercisesAvoid: intake?.exercisesAvoid ?? undefined,
    squatLbs: parseNum(intake?.squatLbs),
    benchLbs: parseNum(intake?.benchLbs),
    deadliftLbs: parseNum(intake?.deadliftLbs),
    ohpLbs: parseNum(intake?.ohpLbs),
    rowLbs: parseNum(intake?.rowLbs),

    nonNegotiableMovements: intake?.nonNegotiableMovements ?? undefined,
    preLiftRoutine: intake?.preLiftRoutine ?? undefined,
    splitPreference:
      (intake?.splitPreference as IntakeFormData["splitPreference"] | null) ?? [],
    proximityToFailure:
      (intake?.proximityToFailure as IntakeFormData["proximityToFailure"]) ?? undefined,

    parqHeartCondition: intake?.parqHeartCondition ?? undefined,
    parqChestPainActive: intake?.parqChestPainActive ?? undefined,
    parqChestPainRest: intake?.parqChestPainRest ?? undefined,
    parqDizziness: intake?.parqDizziness ?? undefined,
    parqBoneJoint: intake?.parqBoneJoint ?? undefined,
    parqBpHeartMeds: intake?.parqBpHeartMeds ?? undefined,
    parqOtherReason: intake?.parqOtherReason ?? undefined,
    medicalConditions: intake?.medicalConditions ?? undefined,
    medications: intake?.medications ?? undefined,
    surgeries5yr: intake?.surgeries5yr ?? undefined,
    pastInjuries: intake?.pastInjuries ?? undefined,
    currentPain: intake?.currentPain ?? undefined,
    doctorCleared: (intake?.doctorCleared as IntakeFormData["doctorCleared"]) ?? undefined,

    sleepHours: parseNum(intake?.sleepHours),
    sleepQuality: intake?.sleepQuality ?? undefined,
    stressLevel: intake?.stressLevel ?? undefined,
    workActivity: (intake?.workActivity as IntakeFormData["workActivity"] | null) ?? [],
    workSchedule: intake?.workSchedule ?? undefined,
    outsideCommitments: intake?.outsideCommitments ?? undefined,

    dietaryPattern:
      (intake?.dietaryPattern as IntakeFormData["dietaryPattern"] | null) ?? [],
    dietaryPatternOther: intake?.dietaryPatternOther ?? undefined,
    foodAllergies: intake?.foodAllergies ?? undefined,
    dietaryRestrictions: intake?.dietaryRestrictions ?? undefined,
    typicalDayFood: intake?.typicalDayFood ?? undefined,
    waterPerDay: intake?.waterPerDay ?? undefined,
    alcoholPerWeek: parseNum(intake?.alcoholPerWeek),
    caffeinePerDay: intake?.caffeinePerDay ?? undefined,
    supplements: intake?.supplements ?? undefined,
    biggestNutritionChallenge: intake?.biggestNutritionChallenge ?? undefined,

    anythingElse: intake?.anythingElse ?? undefined,
    sharesMeasurements: intake?.sharesMeasurements ?? false,
    // Initial body-stats measurements are not stored on intake; the
    // weekly check-in flow handles ongoing measurements separately.

    ackInfoAccurate: intake?.acknowledgedAt ? true : undefined,
    ackLiability: intake?.acknowledgedAt ? true : undefined,
    ackOpenCommunication: intake?.acknowledgedAt ? true : undefined,
    acknowledgedName: intake?.acknowledgedName ?? undefined,
    acknowledgedDate: intake?.acknowledgedAt
      ? intake.acknowledgedAt.toISOString().slice(0, 10)
      : undefined,
  };
}
