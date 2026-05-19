import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const id = uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();

export const clients = pgTable("clients", {
  id,
  name: text("name").notNull(),
  preferredName: text("preferred_name"),
  dateOfBirth: date("date_of_birth"),
  email: text("email"),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  address: text("address"),
  coachingType: text("coaching_type").notNull().default("in_person"),
  referralSource: text("referral_source"),
  startDate: date("start_date"),
  targetStartDate: date("target_start_date"),
  budgetRange: text("budget_range"),
  commPreference: text("comm_preference").array(),
  commPreferenceOther: text("comm_preference_other"),
  commPreferenceHandle: text("comm_preference_handle"),
  goalsSummary: text("goals_summary"),
  active: boolean("active").notNull().default(true),
  createdAt,
  updatedAt,
});

export const workouts = pgTable(
  "workouts",
  {
    id,
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    performedOn: date("performed_on").notNull(),
    notes: text("notes"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    clientDateIdx: index("workouts_client_date_idx").on(
      t.clientId,
      t.performedOn,
    ),
  }),
);

export const workoutExercises = pgTable(
  "workout_exercises",
  {
    id,
    workoutId: uuid("workout_id")
      .notNull()
      .references(() => workouts.id, { onDelete: "cascade" }),
    exerciseName: text("exercise_name").notNull(),
    position: integer("position").notNull(),
    notes: text("notes"),
  },
  (t) => ({
    uniquePosition: unique("workout_exercises_position_uniq").on(
      t.workoutId,
      t.position,
    ),
    nameIdx: index("workout_exercises_name_idx").on(t.exerciseName),
  }),
);

export const workoutSets = pgTable(
  "workout_sets",
  {
    id,
    exerciseId: uuid("exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    setIndex: integer("set_index").notNull(),
    reps: integer("reps").notNull(),
    weightLbs: numeric("weight_lbs", { precision: 6, scale: 2 }),
    rpe: numeric("rpe", { precision: 3, scale: 1 }),
    isWarmup: boolean("is_warmup").notNull().default(false),
  },
  (t) => ({
    uniqueSet: unique("workout_sets_index_uniq").on(t.exerciseId, t.setIndex),
  }),
);

export const bodyStats = pgTable(
  "body_stats",
  {
    id,
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    weekStart: date("week_start").notNull(),
    weightLbs: numeric("weight_lbs", { precision: 5, scale: 2 }),
    waistIn: numeric("waist_in", { precision: 5, scale: 2 }),
    chestIn: numeric("chest_in", { precision: 5, scale: 2 }),
    hipsIn: numeric("hips_in", { precision: 5, scale: 2 }),
    sleepHoursAvg: numeric("sleep_hours_avg", { precision: 3, scale: 1 }),
    wellness: integer("wellness"),
    notes: text("notes"),
    createdAt,
  },
  (t) => ({
    uniqueWeek: unique("body_stats_client_week_uniq").on(
      t.clientId,
      t.weekStart,
    ),
    clientWeekIdx: index("body_stats_client_week_idx").on(
      t.clientId,
      t.weekStart,
    ),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id,
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull().default(60),
    location: text("location"),
    preNotes: text("pre_notes"),
    postNotes: text("post_notes"),
    status: text("status").notNull().default("scheduled"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    startsIdx: index("sessions_starts_idx").on(t.startsAt),
    clientStartsIdx: index("sessions_client_idx").on(t.clientId, t.startsAt),
  }),
);

export const goals = pgTable(
  "goals",
  {
    id,
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    targetDate: date("target_date"),
    done: boolean("done").notNull().default(false),
    doneAt: timestamp("done_at", { withTimezone: true }),
    createdAt,
  },
  (t) => ({
    clientIdx: index("goals_client_idx").on(t.clientId, t.done),
  }),
);

export const nutritionNotes = pgTable(
  "nutrition_notes",
  {
    id,
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    noteDate: date("note_date").notNull().defaultNow(),
    bodyMd: text("body_md").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    clientDateIdx: index("nutrition_notes_client_date_idx").on(
      t.clientId,
      t.noteDate,
    ),
  }),
);

export const clientIntake = pgTable("client_intake", {
  id,
  clientId: uuid("client_id")
    .notNull()
    .unique()
    .references(() => clients.id, { onDelete: "cascade" }),

  emergencyName: text("emergency_name"),
  emergencyRelationship: text("emergency_relationship"),
  emergencyPhone: text("emergency_phone"),

  preferredGymLocation: text("preferred_gym_location"),
  maxTravelDistance: text("max_travel_distance"),
  gymAccess: text("gym_access").array(),
  equipmentAvailable: text("equipment_available"),
  daysPerWeek: integer("days_per_week").array(),
  sessionLengthMin: integer("session_length_min").array(),
  preferredTimeOfDay: text("preferred_time_of_day"),

  primaryGoal: text("primary_goal"),
  primaryGoalOther: text("primary_goal_other"),
  secondaryGoal: text("secondary_goal"),
  goalReason: text("goal_reason"),
  goalTimeline: text("goal_timeline"),
  goalTimelineOther: text("goal_timeline_other"),
  measureProgress: text("measure_progress").array(),
  measureProgressOther: text("measure_progress_other"),
  commitmentLevel: integer("commitment_level"),

  activityLevel: text("activity_level"),
  yearsExperience: text("years_experience"),
  currentlyTraining: boolean("currently_training"),
  currentTrainingDays: integer("current_training_days"),
  currentProgram: text("current_program"),
  currentProgramDuration: text("current_program_duration"),
  workedWithTrainer: boolean("worked_with_trainer"),
  trainerLiked: text("trainer_liked"),
  trainerDisliked: text("trainer_disliked"),
  exercisesEnjoy: text("exercises_enjoy"),
  exercisesAvoid: text("exercises_avoid"),
  squatLbs: numeric("squat_lbs", { precision: 6, scale: 2 }),
  benchLbs: numeric("bench_lbs", { precision: 6, scale: 2 }),
  deadliftLbs: numeric("deadlift_lbs", { precision: 6, scale: 2 }),
  ohpLbs: numeric("ohp_lbs", { precision: 6, scale: 2 }),
  rowLbs: numeric("row_lbs", { precision: 6, scale: 2 }),

  nonNegotiableMovements: text("non_negotiable_movements"),
  preLiftRoutine: text("pre_lift_routine"),
  splitPreference: text("split_preference").array(),
  proximityToFailure: text("proximity_to_failure"),

  parqHeartCondition: boolean("parq_heart_condition"),
  parqChestPainActive: boolean("parq_chest_pain_active"),
  parqChestPainRest: boolean("parq_chest_pain_rest"),
  parqDizziness: boolean("parq_dizziness"),
  parqBoneJoint: boolean("parq_bone_joint"),
  parqBpHeartMeds: boolean("parq_bp_heart_meds"),
  parqOtherReason: boolean("parq_other_reason"),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  surgeries5yr: text("surgeries_5yr"),
  pastInjuries: text("past_injuries"),
  currentPain: text("current_pain"),
  doctorCleared: text("doctor_cleared"),

  sleepHours: numeric("sleep_hours", { precision: 3, scale: 1 }),
  sleepQuality: integer("sleep_quality"),
  stressLevel: integer("stress_level"),
  workActivity: text("work_activity").array(),
  workSchedule: text("work_schedule"),
  outsideCommitments: text("outside_commitments"),

  dietaryPattern: text("dietary_pattern").array(),
  dietaryPatternOther: text("dietary_pattern_other"),
  foodAllergies: text("food_allergies"),
  dietaryRestrictions: text("dietary_restrictions"),
  typicalDayFood: text("typical_day_food"),
  waterPerDay: text("water_per_day"),
  alcoholPerWeek: numeric("alcohol_per_week", { precision: 4, scale: 1 }),
  caffeinePerDay: text("caffeine_per_day"),
  supplements: text("supplements"),
  biggestNutritionChallenge: text("biggest_nutrition_challenge"),

  anythingElse: text("anything_else"),
  sharesMeasurements: boolean("shares_measurements"),

  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  acknowledgedName: text("acknowledged_name"),

  waiverVersion: text("waiver_version"),
  waiverAcceptedAt: timestamp("waiver_accepted_at", { withTimezone: true }),

  createdAt,
  updatedAt,
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientIntake = typeof clientIntake.$inferSelect;
export type NewClientIntake = typeof clientIntake.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type BodyStat = typeof bodyStats.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type NutritionNote = typeof nutritionNotes.$inferSelect;
