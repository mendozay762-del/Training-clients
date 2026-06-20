CREATE TABLE "prescribed_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prescribed_exercise_id" uuid NOT NULL,
	"set_index" integer NOT NULL,
	"reps_low" integer,
	"reps_high" integer,
	"reps_text" text,
	"rir_low" integer,
	"rir_high" integer,
	CONSTRAINT "prescribed_sets_set_uniq" UNIQUE("prescribed_exercise_id","set_index")
);
--> statement-breakpoint
ALTER TABLE "prescribed_exercises" ADD COLUMN "rir_low" integer;--> statement-breakpoint
ALTER TABLE "prescribed_exercises" ADD COLUMN "rir_high" integer;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "prescribed_sets" ADD CONSTRAINT "prescribed_sets_prescribed_exercise_id_prescribed_exercises_id_fk" FOREIGN KEY ("prescribed_exercise_id") REFERENCES "public"."prescribed_exercises"("id") ON DELETE cascade ON UPDATE no action;