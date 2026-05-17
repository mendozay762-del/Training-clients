"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { SingleSelectField } from "../fields/single-select-field";
import {
  requiresExperience,
  type IntakeFormData,
} from "@/lib/schemas/client-intake";

const splitOptions = [
  { value: "full_body", label: "Full body" },
  { value: "upper_lower", label: "Upper / Lower" },
  { value: "ppl", label: "Push / Pull / Legs" },
  { value: "body_part", label: "Body-part split" },
  { value: "other", label: "Other" },
  { value: "no_preference", label: "No preference" },
];
const proximityOptions = [
  { value: "2_3_rir", label: "Always leave 2–3 reps in the tank" },
  { value: "compounds_short", label: "Push compounds hard but stop short of failure" },
  { value: "isolation_failure", label: "Isolation work to failure" },
  { value: "all_failure", label: "Everything to failure" },
  { value: "no_preference", label: "No strong preference" },
];

export function Section5Preferences() {
  const { register, control, watch } = useFormContext<IntakeFormData>();
  const yearsExperience = watch("yearsExperience");

  if (!requiresExperience(yearsExperience)) {
    return null;
  }

  return (
    <IntakeSectionCard
      number={5}
      title="Training Preferences"
      hint="For clients with 1+ years of consistent training experience. These help me respect what's already working so we build on it rather than tear it down."
    >
      <TextField
        label="Non-negotiable movements"
        number={41}
        hint='Lifts you want to keep no matter what (e.g., "I always do flat bench")'
        multiline
        rows={2}
        {...register("nonNegotiableMovements")}
      />
      <TextField
        label="Pre-lift routine"
        number={42}
        hint="Warm-up, mobility, activation drills, foam rolling, specific warm-up sets"
        multiline
        rows={3}
        {...register("preLiftRoutine")}
      />
      <Controller
        control={control}
        name="splitPreference"
        render={({ field }) => (
          <SingleSelectField
            number={43}
            label="Training split preference"
            options={splitOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="proximityToFailure"
        render={({ field }) => (
          <SingleSelectField
            number={44}
            label="Proximity to failure"
            options={proximityOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
    </IntakeSectionCard>
  );
}
