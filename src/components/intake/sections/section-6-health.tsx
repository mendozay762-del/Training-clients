"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { YesNoField } from "../fields/yes-no-field";
import { SingleSelectField } from "../fields/single-select-field";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const parqQuestions: Array<{
  name: keyof IntakeFormData;
  number: number;
  label: string;
}> = [
  {
    name: "parqHeartCondition",
    number: 45,
    label:
      "Has a doctor ever said you have a heart condition and that you should only do physical activity recommended by a doctor?",
  },
  {
    name: "parqChestPainActive",
    number: 46,
    label: "Do you feel chest pain when you do physical activity?",
  },
  {
    name: "parqChestPainRest",
    number: 47,
    label:
      "In the past month, have you had chest pain when you were not doing physical activity?",
  },
  {
    name: "parqDizziness",
    number: 48,
    label:
      "Do you lose your balance because of dizziness, or do you ever lose consciousness?",
  },
  {
    name: "parqBoneJoint",
    number: 49,
    label:
      "Do you have a bone or joint problem that could be made worse by physical activity?",
  },
  {
    name: "parqBpHeartMeds",
    number: 50,
    label:
      "Is a doctor currently prescribing drugs for your blood pressure or a heart condition?",
  },
  {
    name: "parqOtherReason",
    number: 51,
    label: "Do you know of any other reason you should not do physical activity?",
  },
];

const doctorClearedOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
  { value: "not_applicable", label: "Not applicable" },
];

export function Section6Health() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  const anyParqYes = parqQuestions.some(
    (q) => watch(q.name) === true,
  );

  return (
    <IntakeSectionCard
      number={6}
      title="Health & Injury Screening"
      hint="The following 7 yes/no questions are standard pre-exercise screening. If you answer yes to any, doctor's clearance is recommended before training begins."
    >
      {parqQuestions.map((q) => (
        <Controller
          key={q.name}
          control={control}
          name={q.name}
          render={({ field, fieldState }) => (
            <YesNoField
              number={q.number}
              label={q.label}
              value={(field.value as boolean | undefined) ?? null}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
      ))}
      {anyParqYes && (
        <div className="flex items-start gap-3 rounded-card border border-amber-500/30 bg-amber-500/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-200">
            One or more PAR-Q answers indicate doctor&apos;s clearance may
            be required before training begins. The app captures this for
            your records — clearance is enforced offline.
          </p>
        </div>
      )}
      <TextField
        label="List any current medical conditions"
        number={52}
        multiline
        rows={2}
        {...register("medicalConditions")}
      />
      <TextField
        label="List any current medications and supplements"
        number={53}
        multiline
        rows={2}
        {...register("medications")}
      />
      <TextField
        label="List any surgeries in the past 5 years"
        number={54}
        multiline
        rows={2}
        {...register("surgeries5yr")}
      />
      <TextField
        label="List any past injuries that still affect you today"
        hint="Specify body part and what happened"
        number={55}
        multiline
        rows={3}
        {...register("pastInjuries")}
      />
      <TextField
        label="Any current pain, aches, or movement limitations I should know about?"
        number={56}
        multiline
        rows={2}
        {...register("currentPain")}
      />
      <Controller
        control={control}
        name="doctorCleared"
        render={({ field }) => (
          <SingleSelectField
            number={57}
            label="Have you been cleared by a doctor for exercise?"
            options={doctorClearedOptions}
            value={field.value ?? null}
            onChange={field.onChange}
          />
        )}
      />
    </IntakeSectionCard>
  );
}
