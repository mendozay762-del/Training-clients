"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { YesNoField } from "../fields/yes-no-field";
import { ConditionalReveal } from "../fields/conditional-reveal";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

export function Section9Final() {
  const { register, control, watch } = useFormContext<IntakeFormData>();
  const sharesMeasurements = watch("sharesMeasurements");
  return (
    <IntakeSectionCard number={9} title="Final Notes & Optional Measurements">
      <TextField
        label="Anything else I should know about you so I can do my job well?"
        hint="Lifestyle, history, mindset — anything"
        number={73}
        multiline
        rows={4}
        {...register("anythingElse")}
      />
      <Controller
        control={control}
        name="sharesMeasurements"
        render={({ field }) => (
          <YesNoField
            number={74}
            label="Are you comfortable sharing basic body measurements to help track progress?"
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <ConditionalReveal when={sharesMeasurements === true}>
        <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          75. Initial measurements (inches / lbs)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Weight (lbs)"
            type="number"
            inputMode="decimal"
            step="0.1"
            {...register("weightLbs", { valueAsNumber: true })}
          />
          <TextField
            label="Waist (in)"
            type="number"
            inputMode="decimal"
            step="0.25"
            {...register("waistIn", { valueAsNumber: true })}
          />
          <TextField
            label="Chest (in)"
            type="number"
            inputMode="decimal"
            step="0.25"
            {...register("chestIn", { valueAsNumber: true })}
          />
          <TextField
            label="Hips (in)"
            type="number"
            inputMode="decimal"
            step="0.25"
            {...register("hipsIn", { valueAsNumber: true })}
          />
        </div>
      </ConditionalReveal>
    </IntakeSectionCard>
  );
}
