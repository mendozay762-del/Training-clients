import { z } from "zod";

export const WAIVER_VERSION = "v1-draft-2026-05";

export const COACHING_TYPES = ["in_person", "remote", "hybrid"] as const;
export const GYM_ACCESS = ["home_gym", "commercial", "outdoor", "none"] as const;
export const COMM_PREFS = [
  "phone",
  "text",
  "instagram",
  "snapchat",
  "email",
  "other",
] as const;
export const PRIMARY_GOALS = [
  "build_muscle",
  "lose_fat",
  "build_strength",
  "general_fitness",
  "body_recomp",
  "other",
] as const;
export const GOAL_TIMELINES = [
  "3_months",
  "6_months",
  "12_months",
  "no_timeline",
  "other",
] as const;
export const ACTIVITY_LEVELS = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
] as const;
export const YEARS_EXPERIENCE = [
  "none",
  "under_1",
  "1_to_2",
  "3_to_5",
  "5_plus",
] as const;
export const SPLITS = [
  "full_body",
  "upper_lower",
  "ppl",
  "body_part",
  "other",
  "no_preference",
] as const;
export const PROXIMITY = [
  "2_3_rir",
  "compounds_short",
  "isolation_failure",
  "all_failure",
  "no_preference",
] as const;
export const DOCTOR_CLEARED = ["yes", "no", "not_sure", "not_applicable"] as const;
export const WORK_ACTIVITY = ["desk", "on_feet", "physical_labor"] as const;
export const DIETARY_PATTERNS = [
  "omnivore",
  "vegetarian",
  "vegan",
  "pescatarian",
  "other",
] as const;
export const MEASURE_PROGRESS = [
  "scale_weight",
  "body_measurements",
  "strength_numbers",
  "clothes_fit",
  "energy_feel",
  "other",
] as const;
export const SESSION_LENGTHS = [30, 45, 60, 75] as const;
export const DAYS_PER_WEEK = [2, 3, 4, 5, 6] as const;

const optStr = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optNum = z
  .union([z.number(), z.nan(), z.undefined()])
  .transform((v) => (typeof v === "number" && !Number.isNaN(v) ? v : undefined));

const requiresExperience = (yrs?: string) =>
  yrs === "1_to_2" || yrs === "3_to_5" || yrs === "5_plus";

export const intakeFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    preferredName: optStr,
    dateOfBirth: optStr,
    email: optStr,
    phone: optStr,
    city: optStr,
    state: optStr,
    address: optStr,
    emergencyName: optStr,
    emergencyRelationship: optStr,
    emergencyPhone: optStr,
    referralSource: optStr,

    coachingType: z.enum(COACHING_TYPES).default("in_person"),
    preferredGymLocation: optStr,
    maxTravelDistance: optStr,
    gymAccess: z.array(z.enum(GYM_ACCESS)).default([]),
    equipmentAvailable: optStr,
    daysPerWeek: z.array(z.number().int()).default([]),
    sessionLengthMin: z.array(z.number().int()).default([]),
    preferredTimeOfDay: optStr,
    targetStartDate: optStr,
    budgetRange: optStr,
    commPreference: z.array(z.enum(COMM_PREFS)).default([]),
    commPreferenceOther: optStr,
    commPreferenceHandle: optStr,

    primaryGoal: z.enum(PRIMARY_GOALS).optional(),
    primaryGoalOther: optStr,
    secondaryGoal: optStr,
    goalReason: optStr,
    goalTimeline: z.enum(GOAL_TIMELINES).optional(),
    goalTimelineOther: optStr,
    measureProgress: z.array(z.enum(MEASURE_PROGRESS)).default([]),
    measureProgressOther: optStr,
    commitmentLevel: z.number().int().min(1).max(10).optional(),

    activityLevel: z.enum(ACTIVITY_LEVELS).optional(),
    yearsExperience: z.enum(YEARS_EXPERIENCE).optional(),
    currentlyTraining: z.boolean().optional(),
    currentTrainingDays: optNum,
    currentProgram: optStr,
    currentProgramDuration: optStr,
    workedWithTrainer: z.boolean().optional(),
    trainerLiked: optStr,
    trainerDisliked: optStr,
    exercisesEnjoy: optStr,
    exercisesAvoid: optStr,
    squatLbs: optNum,
    benchLbs: optNum,
    deadliftLbs: optNum,
    ohpLbs: optNum,
    rowLbs: optNum,

    nonNegotiableMovements: optStr,
    preLiftRoutine: optStr,
    splitPreference: z.array(z.enum(SPLITS)).default([]),
    proximityToFailure: z.enum(PROXIMITY).optional(),

    parqHeartCondition: z.boolean().optional(),
    parqChestPainActive: z.boolean().optional(),
    parqChestPainRest: z.boolean().optional(),
    parqDizziness: z.boolean().optional(),
    parqBoneJoint: z.boolean().optional(),
    parqBpHeartMeds: z.boolean().optional(),
    parqOtherReason: z.boolean().optional(),
    medicalConditions: optStr,
    medications: optStr,
    surgeries5yr: optStr,
    pastInjuries: optStr,
    currentPain: optStr,
    doctorCleared: z.enum(DOCTOR_CLEARED).optional(),

    sleepHours: optNum,
    sleepQuality: z.number().int().min(1).max(10).optional(),
    stressLevel: z.number().int().min(1).max(10).optional(),
    workActivity: z.array(z.enum(WORK_ACTIVITY)).default([]),
    workSchedule: optStr,
    outsideCommitments: optStr,

    dietaryPattern: z.array(z.enum(DIETARY_PATTERNS)).default([]),
    dietaryPatternOther: optStr,
    foodAllergies: optStr,
    dietaryRestrictions: optStr,
    typicalDayFood: optStr,
    waterPerDay: optStr,
    alcoholPerWeek: optNum,
    caffeinePerDay: optStr,
    supplements: optStr,
    biggestNutritionChallenge: optStr,

    anythingElse: optStr,
    sharesMeasurements: z.boolean().default(false),
    weightLbs: optNum,
    waistIn: optNum,
    chestIn: optNum,
    hipsIn: optNum,

    ackInfoAccurate: z.boolean().optional(),
    ackLiability: z.boolean().optional(),
    ackOpenCommunication: z.boolean().optional(),
    acknowledgedName: optStr,
    acknowledgedDate: optStr,
  });

export type IntakeFormData = z.input<typeof intakeFormSchema>;
export type IntakeFormParsed = z.output<typeof intakeFormSchema>;

export { requiresExperience };
