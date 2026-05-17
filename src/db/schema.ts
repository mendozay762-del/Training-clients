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
  email: text("email"),
  phone: text("phone"),
  startDate: date("start_date"),
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

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
export type BodyStat = typeof bodyStats.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type NutritionNote = typeof nutritionNotes.$inferSelect;
