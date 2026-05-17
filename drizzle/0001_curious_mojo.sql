CREATE TABLE "client_intake" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"emergency_name" text,
	"emergency_relationship" text,
	"emergency_phone" text,
	"preferred_gym_location" text,
	"max_travel_distance" text,
	"gym_access" text,
	"equipment_available" text,
	"days_per_week" integer,
	"session_length_min" integer,
	"preferred_time_of_day" text,
	"primary_goal" text,
	"primary_goal_other" text,
	"secondary_goal" text,
	"goal_reason" text,
	"goal_timeline" text,
	"goal_timeline_other" text,
	"measure_progress" text[],
	"measure_progress_other" text,
	"commitment_level" integer,
	"activity_level" text,
	"years_experience" text,
	"currently_training" boolean,
	"current_training_days" integer,
	"current_program" text,
	"current_program_duration" text,
	"worked_with_trainer" boolean,
	"trainer_liked" text,
	"trainer_disliked" text,
	"exercises_enjoy" text,
	"exercises_avoid" text,
	"squat_lbs" numeric(6, 2),
	"bench_lbs" numeric(6, 2),
	"deadlift_lbs" numeric(6, 2),
	"ohp_lbs" numeric(6, 2),
	"row_lbs" numeric(6, 2),
	"non_negotiable_movements" text,
	"pre_lift_routine" text,
	"split_preference" text,
	"proximity_to_failure" text,
	"parq_heart_condition" boolean,
	"parq_chest_pain_active" boolean,
	"parq_chest_pain_rest" boolean,
	"parq_dizziness" boolean,
	"parq_bone_joint" boolean,
	"parq_bp_heart_meds" boolean,
	"parq_other_reason" boolean,
	"medical_conditions" text,
	"medications" text,
	"surgeries_5yr" text,
	"past_injuries" text,
	"current_pain" text,
	"doctor_cleared" text,
	"sleep_hours" numeric(3, 1),
	"sleep_quality" integer,
	"stress_level" integer,
	"work_activity" text,
	"work_schedule" text,
	"outside_commitments" text,
	"dietary_pattern" text,
	"dietary_pattern_other" text,
	"food_allergies" text,
	"dietary_restrictions" text,
	"typical_day_food" text,
	"water_per_day" text,
	"alcohol_per_week" numeric(4, 1),
	"caffeine_per_day" text,
	"supplements" text,
	"biggest_nutrition_challenge" text,
	"anything_else" text,
	"shares_measurements" boolean,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_intake_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "body_stats" ADD COLUMN "waist_in" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "body_stats" ADD COLUMN "chest_in" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "body_stats" ADD COLUMN "hips_in" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "preferred_name" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "coaching_type" text DEFAULT 'in_person' NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "referral_source" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "target_start_date" date;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "budget_range" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "comm_preference" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "comm_preference_other" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "comm_preference_handle" text;--> statement-breakpoint
ALTER TABLE "client_intake" ADD CONSTRAINT "client_intake_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;