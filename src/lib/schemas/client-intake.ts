import { z } from "zod";

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
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    email: optStr,
    phone: optStr,
    city: optStr,
    state: optStr,
    address: optStr,
    emergencyName: z.string().trim().min(1, "Emergency contact name required"),
    emergencyRelationship: z
      .string()
      .trim()
      .min(1, "Relationship required"),
    emergencyPhone: z.string().trim().min(1, "Emergency phone required"),
    referralSource: optStr,

    coachingType: z.enum(COACHING_TYPES, {
      required_error: "Coaching type required",
    }),
    preferredGymLocation: optStr,
    maxTravelDistance: optStr,
    gymAccess: z.enum(GYM_ACCESS).optional(),
    equipmentAvailable: optStr,
    daysPerWeek: optNum,
    sessionLengthMin: optNum,
    preferredTimeOfDay: optStr,
    targetStartDate: optStr,
    budgetRange: optStr,
    commPreference: z.enum(COMM_PREFS).optional(),
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
    splitPreference: z.enum(SPLITS).optional(),
    proximityToFailure: z.enum(PROXIMITY).optional(),

    parqHeartCondition: z.boolean({ required_error: "Required" }),
    parqChestPainActive: z.boolean({ required_error: "Required" }),
    parqChestPainRest: z.boolean({ required_error: "Required" }),
    parqDizziness: z.boolean({ required_error: "Required" }),
    parqBoneJoint: z.boolean({ required_error: "Required" }),
    parqBpHeartMeds: z.boolean({ required_error: "Required" }),
    parqOtherReason: z.boolean({ required_error: "Required" }),
    medicalConditions: optStr,
    medications: optStr,
    surgeries5yr: optStr,
    pastInjuries: optStr,
    currentPain: optStr,
    doctorCleared: z.enum(DOCTOR_CLEARED).optional(),

    sleepHours: optNum,
    sleepQuality: z.number().int().min(1).max(10).optional(),
    stressLevel: z.number().int().min(1).max(10).optional(),
    workActivity: z.enum(WORK_ACTIVITY).optional(),
    workSchedule: optStr,
    outsideCommitments: optStr,

    dietaryPattern: z.enum(DIETARY_PATTERNS).optional(),
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

    ackInfoAccurate: z.literal(true, {
      errorMap: () => ({ message: "Please confirm" }),
    }),
    ackLiability: z.literal(true, {
      errorMap: () => ({ message: "Please confirm" }),
    }),
    ackOpenCommunication: z.literal(true, {
      errorMap: () => ({ message: "Please confirm" }),
    }),
    acknowledgedName: z.string().trim().min(1, "Name required"),
    acknowledgedDate: z.string().min(1, "Date required"),
  })
  .refine((d) => d.email || d.phone, {
    message: "Please provide at least email or phone",
    path: ["email"],
  })
  .refine(
    (d) => {
      if (d.coachingType === "in_person" || d.coachingType === "hybrid") {
        return Boolean(d.address && d.address.length > 0);
      }
      return true;
    },
    { message: "Address required for in-person/hybrid", path: ["address"] },
  );

export type IntakeFormData = z.input<typeof intakeFormSchema>;
export type IntakeFormParsed = z.output<typeof intakeFormSchema>;

export { requiresExperience };
