"use client";

import { Controller, useFormContext } from "react-hook-form";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { ConditionalReveal } from "../fields/conditional-reveal";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

export function Section1Personal() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormData>();
  const coachingType = watch("coachingType");
  const showAddress = coachingType === "in_person" || coachingType === "hybrid";

  return (
    <IntakeSectionCard number={1} title="Personal Information">
      <TextField
        label="Full name"
        number={1}
        required
        autoComplete="name"
        {...register("name")}
        error={errors.name?.message}
      />
      <TextField
        label="What should I call you?"
        hint="Preferred name or nickname"
        number={2}
        {...register("preferredName")}
      />
      <TextField
        label="Date of birth"
        number={3}
        required
        type="date"
        {...register("dateOfBirth")}
        error={errors.dateOfBirth?.message}
      />
      <TextField
        label="Email"
        number={4}
        type="email"
        autoComplete="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <TextField
        label="Phone number"
        number={5}
        type="tel"
        autoComplete="tel"
        {...register("phone")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="City" number={6} {...register("city")} />
        <TextField label="State" {...register("state")} />
      </div>
      <ConditionalReveal when={showAddress}>
        <TextField
          label="Full address"
          number={7}
          required
          hint="For in-person sessions at home or a private location"
          multiline
          rows={2}
          {...register("address")}
          error={errors.address?.message}
        />
      </ConditionalReveal>
      <Controller
        name="emergencyName"
        render={({ field, fieldState }) => (
          <TextField
            label="Emergency contact — name"
            number={8}
            required
            {...field}
            value={field.value ?? ""}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="emergencyRelationship"
        render={({ field, fieldState }) => (
          <TextField
            label="Emergency contact — relationship to you"
            number={9}
            required
            {...field}
            value={field.value ?? ""}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        name="emergencyPhone"
        render={({ field, fieldState }) => (
          <TextField
            label="Emergency contact — phone number"
            number={10}
            required
            type="tel"
            {...field}
            value={field.value ?? ""}
            error={fieldState.error?.message}
          />
        )}
      />
      <TextField
        label="How did you hear about me?"
        number={11}
        {...register("referralSource")}
      />
    </IntakeSectionCard>
  );
}
