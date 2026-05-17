CREATE TABLE "body_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"weight_lbs" numeric(5, 2),
	"sleep_hours_avg" numeric(3, 1),
	"wellness" integer,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "body_stats_client_week_uniq" UNIQUE("client_id","week_start")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"start_date" date,
	"goals_summary" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"body" text NOT NULL,
	"target_date" date,
	"done" boolean DEFAULT false NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"note_date" date DEFAULT now() NOT NULL,
	"body_md" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_min" integer DEFAULT 60 NOT NULL,
	"location" text,
	"pre_notes" text,
	"post_notes" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"position" integer NOT NULL,
	"notes" text,
	CONSTRAINT "workout_exercises_position_uniq" UNIQUE("workout_id","position")
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"set_index" integer NOT NULL,
	"reps" integer NOT NULL,
	"weight_lbs" numeric(6, 2),
	"rpe" numeric(3, 1),
	"is_warmup" boolean DEFAULT false NOT NULL,
	CONSTRAINT "workout_sets_index_uniq" UNIQUE("exercise_id","set_index")
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"performed_on" date NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "body_stats" ADD CONSTRAINT "body_stats_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_notes" ADD CONSTRAINT "nutrition_notes_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "body_stats_client_week_idx" ON "body_stats" USING btree ("client_id","week_start");--> statement-breakpoint
CREATE INDEX "goals_client_idx" ON "goals" USING btree ("client_id","done");--> statement-breakpoint
CREATE INDEX "nutrition_notes_client_date_idx" ON "nutrition_notes" USING btree ("client_id","note_date");--> statement-breakpoint
CREATE INDEX "sessions_starts_idx" ON "sessions" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "sessions_client_idx" ON "sessions" USING btree ("client_id","starts_at");--> statement-breakpoint
CREATE INDEX "workout_exercises_name_idx" ON "workout_exercises" USING btree ("exercise_name");--> statement-breakpoint
CREATE INDEX "workouts_client_date_idx" ON "workouts" USING btree ("client_id","performed_on");