"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { SingleSelectField } from "../fields/single-select-field";
import { MultiSelectField } from "../fields/multi-select-field";
import { ScaleField } from "../fields/scale-field";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const primaryGoalOptions = [
  { value: "build_muscle", label: "Build muscle" },
  { value: "lose_fat", label: "Lose fat" },
  { value: "build_strength", label: "Build strength" },
  { value: "general_fitness", label: "General fitness" },
  { value: "body_recomp", label: "Body recomposition" },
  { value: "other", label: "Other" },
];
const goalTimelineOptions = [
  { value: "3_months", label: "3 months" },
  { value: "6_months", label: "6 months" },
  { value: "12_months", label: "12 months" },
  { value: "no_timeline", label: "No specific timeline" },
  { value: "other", label: "Other" },
];
const measureOptions = [
  { value: "scale_weight", label: "Scale weight" },
  { value: "body_measurements", label: "Body measurements" },
  { value: "strength_numbers", label: "Strength / lift numbers" },
  { value: "clothes_fit", label: "How clothes fit" },
  { value: "energy_feel", label: "Energy and how you feel" },
  { value: "other", label: "Other" },
];

export function Section3Goals() {
  const { register, control, watch, setValue } =
    useFormContext<IntakeFormData>();

  return (
    <IntakeSectionCard number={3} title="Goals & Motivation">
      <Controller
        control={control}
        name="primaryGoal"
        render={({ field }) => (
          <SingleSelectField
            number={23}
            label="What is your primary goal?"
            options={primaryGoalOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
            otherKey="other"
            otherValue={watch("primaryGoalOther") ?? ""}
            onOtherChange={(v) =>
              setValue("primaryGoalOther", v, { shouldValidate: false })
            }
          />
        )}
      />
      <TextField
        label="Secondary goal, if any"
        number={24}
        {...register("secondaryGoal")}
      />
      <TextField
        label="Why is this goal important to you right now?"
        number={25}
        multiline
        rows={3}
        {...register("goalReason")}
      />
      <Controller
        control={control}
        name="goalTimeline"
        render={({ field }) => (
          <SingleSelectField
            number={26}
            label="What's your target timeline for this goal?"
            options={goalTimelineOptions}
            value={field.value ?? null}
            onChange={(v) => field.onChange(v)}
            otherKey="other"
            otherValue={watch("goalTimelineOther") ?? ""}
            onOtherChange={(v) =>
              setValue("goalTimelineOther", v, { shouldValidate: false })
            }
          />
        )}
      />
      <Controller
        control={control}
        name="measureProgress"
        render={({ field }) => (
          <MultiSelectField
            number={27}
            label="How will we measure progress together?"
            hint="Check all that apply"
            options={measureOptions}
            value={field.value ?? []}
            onChange={field.onChange}
            otherKey="other"
            otherValue={watch("measureProgressOther") ?? ""}
            onOtherChange={(v) =>
              setValue("measureProgressOther", v, { shouldValidate: false })
            }
          />
        )}
      />
      <Controller
        control={control}
        name="commitmentLevel"
        render={({ field }) => (
          <ScaleField
            number={28}
            label="On a scale of 1–10, how committed are you to this goal right now?"
            value={field.value ?? null}
            onChange={field.onChange}
            minLabel="1 = barely"
            maxLabel="10 = locked in"
          />
        )}
      />
    </IntakeSectionCard>
  );
}
