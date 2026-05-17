"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { SingleSelectField } from "../fields/single-select-field";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const dietaryOptions = [
  { value: "omnivore", label: "Omnivore" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "other", label: "Other" },
];

export function Section8Nutrition() {
  const { register, control, watch, setValue } =
    useFormContext<IntakeFormData>();
  return (
    <IntakeSectionCard number={8} title="Nutrition">
      <Controller
        control={control}
        name="dietaryPattern"
        render={({ field }) => (
          <SingleSelectField
            number={64}
            label="What's your dietary pattern?"
            options={dietaryOptions}
            value={field.value ?? null}
            onChange={field.onChange}
            otherKey="other"
            otherValue={watch("dietaryPatternOther") ?? ""}
            onOtherChange={(v) =>
              setValue("dietaryPatternOther", v, { shouldValidate: false })
            }
          />
        )}
      />
      <TextField
        label="Any food allergies, intolerances, or sensitivities?"
        number={65}
        multiline
        rows={2}
        {...register("foodAllergies")}
      />
      <TextField
        label="Any cultural or religious dietary restrictions?"
        number={66}
        multiline
        rows={2}
        {...register("dietaryRestrictions")}
      />
      <TextField
        label="Walk me through what you'd eat on a typical day"
        hint="Breakfast, lunch, dinner, snacks"
        number={67}
        multiline
        rows={4}
        {...register("typicalDayFood")}
      />
      <TextField
        label="Roughly how much water do you drink per day?"
        number={68}
        {...register("waterPerDay")}
      />
      <TextField
        label="Alcohol intake (drinks per week)"
        number={69}
        type="number"
        inputMode="decimal"
        step="0.5"
        {...register("alcoholPerWeek", { valueAsNumber: true })}
      />
      <TextField
        label="Caffeine intake (cups of coffee, energy drinks, etc. per day)"
        number={70}
        {...register("caffeinePerDay")}
      />
      <TextField
        label="Are you currently taking any supplements? List them."
        number={71}
        multiline
        rows={2}
        {...register("supplements")}
      />
      <TextField
        label="What's your biggest nutrition challenge right now?"
        number={72}
        multiline
        rows={2}
        {...register("biggestNutritionChallenge")}
      />
    </IntakeSectionCard>
  );
}
