"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { SingleSelectField } from "../fields/single-select-field";
import { YesNoField } from "../fields/yes-no-field";
import { ConditionalReveal } from "../fields/conditional-reveal";
import {
  requiresExperience,
  type IntakeFormData,
} from "@/lib/schemas/client-intake";

const activityOptions = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Lightly active" },
  { value: "moderately_active", label: "Moderately active" },
  { value: "very_active", label: "Very active" },
];
const yearsOptions = [
  { value: "none", label: "None" },
  { value: "under_1", label: "Less than 1 year" },
  { value: "1_to_2", label: "1–2 years" },
  { value: "3_to_5", label: "3–5 years" },
  { value: "5_plus", label: "5+ years" },
];

export function Section4History() {
  const { register, control, watch } = useFormContext<IntakeFormData>();
  const yearsExperience = watch("yearsExperience");
  const currentlyTraining = watch("currentlyTraining");
  const workedWithTrainer = watch("workedWithTrainer");
  const showLifts = requiresExperience(yearsExperience);

  return (
    <IntakeSectionCard number={4} title="Training History">
      <Controller
        control={control}
        name="activityLevel"
        render={({ field }) => (
          <SingleSelectField
            number={29}
            label="Current activity level"
            options={activityOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="yearsExperience"
        render={({ field }) => (
          <SingleSelectField
            number={30}
            label="Years of consistent training experience"
            options={yearsOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="currentlyTraining"
        render={({ field }) => (
          <YesNoField
            number={31}
            label="Are you currently training?"
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <ConditionalReveal when={currentlyTraining === true}>
        <TextField
          label="How many days per week?"
          number={32}
          type="number"
          inputMode="numeric"
          {...register("currentTrainingDays", { valueAsNumber: true })}
        />
        <TextField
          label="What kind of program are you following?"
          number={33}
          multiline
          rows={2}
          {...register("currentProgram")}
        />
        <TextField
          label="How long have you been on this program?"
          number={34}
          {...register("currentProgramDuration")}
        />
      </ConditionalReveal>
      <Controller
        control={control}
        name="workedWithTrainer"
        render={({ field }) => (
          <YesNoField
            number={35}
            label="Have you worked with a personal trainer before?"
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <ConditionalReveal when={workedWithTrainer === true}>
        <TextField
          label="What did you like about that experience?"
          number={36}
          multiline
          rows={2}
          {...register("trainerLiked")}
        />
        <TextField
          label="What didn't you like, or what would you do differently?"
          number={37}
          multiline
          rows={2}
          {...register("trainerDisliked")}
        />
      </ConditionalReveal>
      <TextField
        label="Exercises or training styles you enjoy"
        number={38}
        multiline
        rows={2}
        {...register("exercisesEnjoy")}
      />
      <TextField
        label="Exercises or training styles you hate or avoid"
        number={39}
        multiline
        rows={2}
        {...register("exercisesAvoid")}
      />
      <ConditionalReveal when={showLifts}>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          40. Current working weights (lbs) — best estimates fine
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Squat"
            type="number"
            inputMode="decimal"
            step="2.5"
            {...register("squatLbs", { valueAsNumber: true })}
          />
          <TextField
            label="Bench press"
            type="number"
            inputMode="decimal"
            step="2.5"
            {...register("benchLbs", { valueAsNumber: true })}
          />
          <TextField
            label="Deadlift"
            type="number"
            inputMode="decimal"
            step="2.5"
            {...register("deadliftLbs", { valueAsNumber: true })}
          />
          <TextField
            label="Overhead press"
            type="number"
            inputMode="decimal"
            step="2.5"
            {...register("ohpLbs", { valueAsNumber: true })}
          />
          <TextField
            label="Row (any variation)"
            type="number"
            inputMode="decimal"
            step="2.5"
            {...register("rowLbs", { valueAsNumber: true })}
          />
        </div>
      </ConditionalReveal>
    </IntakeSectionCard>
  );
}
