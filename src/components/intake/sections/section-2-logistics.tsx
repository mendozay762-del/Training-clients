"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { SingleSelectField } from "../fields/single-select-field";
import { ConditionalReveal } from "../fields/conditional-reveal";
import {
  COACHING_TYPES,
  COMM_PREFS,
  DAYS_PER_WEEK,
  GYM_ACCESS,
  SESSION_LENGTHS,
} from "@/lib/schemas/client-intake";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const coachingOptions = [
  { value: "in_person", label: "In person" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];
const gymAccessOptions = [
  { value: "home_gym", label: "Home gym" },
  { value: "commercial", label: "Commercial gym" },
  { value: "outdoor", label: "Outdoor space" },
  { value: "none", label: "None" },
];
const daysOptions = DAYS_PER_WEEK.map((n) => ({
  value: String(n),
  label: n === 6 ? "6+" : String(n),
}));
const sessionLengthOptions = SESSION_LENGTHS.map((n) => ({
  value: String(n),
  label: n === 75 ? "75+ min" : `${n} min`,
}));
const commOptions = [
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text" },
  { value: "instagram", label: "Instagram DM" },
  { value: "snapchat", label: "Snapchat" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export function Section2Logistics() {
  const {
    register,
    control,
    watch,
    setValue,
  } = useFormContext<IntakeFormData>();
  const coachingType = watch("coachingType");
  const showInPerson =
    coachingType === "in_person" || coachingType === "hybrid";
  const showRemote = coachingType === "remote" || coachingType === "hybrid";

  return (
    <IntakeSectionCard number={2} title="Training Logistics">
      <Controller
        control={control}
        name="coachingType"
        render={({ field, fieldState }) => (
          <SingleSelectField
            number={12}
            required
            label="Are you looking for in-person, remote, or hybrid training?"
            options={coachingOptions}
            value={field.value ?? null}
            onChange={(v) =>
              field.onChange(v as (typeof COACHING_TYPES)[number])
            }
            error={fieldState.error?.message}
          />
        )}
      />
      <ConditionalReveal when={showInPerson}>
        <TextField
          label="Preferred gym or location"
          number={13}
          {...register("preferredGymLocation")}
        />
        <TextField
          label="Maximum travel distance you'd consider"
          number={14}
          {...register("maxTravelDistance")}
        />
      </ConditionalReveal>
      <ConditionalReveal when={showRemote}>
        <Controller
          control={control}
          name="gymAccess"
          render={({ field }) => (
            <SingleSelectField
              number={15}
              label="What gym do you have access to?"
              options={gymAccessOptions}
              value={field.value ?? null}
              onChange={(v) =>
                field.onChange(v as (typeof GYM_ACCESS)[number])
              }
            />
          )}
        />
        <TextField
          label="What equipment do you have available?"
          number={16}
          hint="List dumbbells, barbells, machines, bands, etc."
          multiline
          rows={2}
          {...register("equipmentAvailable")}
        />
      </ConditionalReveal>
      <Controller
        control={control}
        name="daysPerWeek"
        render={({ field }) => (
          <SingleSelectField
            number={17}
            label="How many days per week can you realistically train?"
            options={daysOptions}
            value={field.value != null ? String(field.value) : null}
            onChange={(v) => field.onChange(parseInt(v, 10))}
          />
        )}
      />
      <Controller
        control={control}
        name="sessionLengthMin"
        render={({ field }) => (
          <SingleSelectField
            number={18}
            label="Preferred session length"
            options={sessionLengthOptions}
            value={field.value != null ? String(field.value) : null}
            onChange={(v) => field.onChange(parseInt(v, 10))}
          />
        )}
      />
      <TextField
        label="Preferred time of day to train"
        number={19}
        {...register("preferredTimeOfDay")}
      />
      <TextField
        label="Target start date"
        number={20}
        type="date"
        {...register("targetStartDate")}
      />
      <TextField
        label="Budget range you're working with for training"
        number={21}
        {...register("budgetRange")}
      />
      <Controller
        control={control}
        name="commPreference"
        render={({ field }) => (
          <SingleSelectField
            number={22}
            label="Best way to reach you for coaching communication"
            options={commOptions}
            value={field.value ?? null}
            onChange={(v) =>
              field.onChange(v as (typeof COMM_PREFS)[number])
            }
            otherKey="other"
            otherValue={watch("commPreferenceOther") ?? ""}
            onOtherChange={(v) =>
              setValue("commPreferenceOther", v, { shouldValidate: false })
            }
          />
        )}
      />
      <TextField
        label="Handle / username (for Instagram, Snapchat, etc.)"
        hint="You enter this yourself — clients usually share it before completing the questionnaire"
        {...register("commPreferenceHandle")}
      />
    </IntakeSectionCard>
  );
}
