CREATE TABLE "prescribed_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescribed_workout_id" uuid NOT NULL,
	"exercise_name" text NOT NULL,
	"order_index" integer NOT NULL,
	"sets" integer,
	"reps_low" integer,
	"reps_high" integer,
	"reps_text" text,
	"load_lbs" numeric(6, 2),
	"load_pct_1rm" numeric(5, 2),
	"load_text" text,
	"rpe_target" numeric(3, 1),
	"rir_target" integer,
	"notes" text,
	CONSTRAINT "prescribed_exercises_order_uniq" UNIQUE("prescribed_workout_id","order_index")
);
--> statement-breakpoint
CREATE TABLE "prescribed_workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"block_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"prescribed_for" date NOT NULL,
	"name" text,
	"notes" text,
	"status" text DEFAULT 'planned' NOT NULL,
	"skip_reason" text,
	"actual_workout_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"style" text,
	"start_date" date,
	"end_date" date,
	"weekly_split_summary" text,
	"notes" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prescribed_exercises" ADD CONSTRAINT "prescribed_exercises_prescribed_workout_id_prescribed_workouts_id_fk" FOREIGN KEY ("prescribed_workout_id") REFERENCES "public"."prescribed_workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescribed_workouts" ADD CONSTRAINT "prescribed_workouts_block_id_training_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."training_blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescribed_workouts" ADD CONSTRAINT "prescribed_workouts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescribed_workouts" ADD CONSTRAINT "prescribed_workouts_actual_workout_id_workouts_id_fk" FOREIGN KEY ("actual_workout_id") REFERENCES "public"."workouts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_blocks" ADD CONSTRAINT "training_blocks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prescribed_workouts_client_date_idx" ON "prescribed_workouts" USING btree ("client_id","prescribed_for");--> statement-breakpoint
CREATE INDEX "prescribed_workouts_block_date_idx" ON "prescribed_workouts" USING btree ("block_id","prescribed_for");--> statement-breakpoint
CREATE INDEX "training_blocks_client_status_idx" ON "training_blocks" USING btree ("client_id","status");--> statement-breakpoint
CREATE INDEX "training_blocks_client_start_idx" ON "training_blocks" USING btree ("client_id","start_date");