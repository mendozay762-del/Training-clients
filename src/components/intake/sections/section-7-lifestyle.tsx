"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { ScaleField } from "../fields/scale-field";
import { SingleSelectField } from "../fields/single-select-field";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const workActivityOptions = [
  { value: "desk", label: "Desk job, mostly sitting" },
  { value: "on_feet", label: "On your feet most of the day" },
  { value: "physical_labor", label: "Physical labor" },
];

export function Section7Lifestyle() {
  const { register, control } = useFormContext<IntakeFormData>();
  return (
    <IntakeSectionCard number={7} title="Lifestyle">
      <TextField
        label="Average hours of sleep per night"
        number={58}
        type="number"
        inputMode="decimal"
        step="0.5"
        {...register("sleepHours", { valueAsNumber: true })}
      />
      <Controller
        control={control}
        name="sleepQuality"
        render={({ field }) => (
          <ScaleField
            number={59}
            label="Rate your sleep quality on a scale of 1–10"
            value={field.value ?? null}
            onChange={field.onChange}
            minLabel="1 = terrible"
            maxLabel="10 = excellent"
          />
        )}
      />
      <Controller
        control={control}
        name="stressLevel"
        render={({ field }) => (
          <ScaleField
            number={60}
            label="Rate your current stress level on a scale of 1–10"
            value={field.value ?? null}
            onChange={field.onChange}
            minLabel="1 = none"
            maxLabel="10 = max"
          />
        )}
      />
      <Controller
        control={control}
        name="workActivity"
        render={({ field }) => (
          <SingleSelectField
            number={61}
            label="How would you describe your work activity level?"
            options={workActivityOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <TextField
        label="What does your typical work schedule look like?"
        hint="9-to-5, shift work, irregular, etc."
        number={62}
        multiline
        rows={2}
        {...register("workSchedule")}
      />
      <TextField
        label="Anything outside of work that takes major time or energy?"
        hint="Kids, side projects, school, caregiving, etc."
        number={63}
        multiline
        rows={2}
        {...register("outsideCommitments")}
      />
    </IntakeSectionCard>
  );
}
