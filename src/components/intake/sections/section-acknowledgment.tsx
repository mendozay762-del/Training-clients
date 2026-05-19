"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { cn } from "@/lib/utils";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

const acknowledgments: Array<{
  name: "ackInfoAccurate" | "ackLiability" | "ackOpenCommunication";
  label: string;
}> = [
  {
    name: "ackInfoAccurate",
    label:
      "The information I've provided is accurate and complete to the best of my knowledge.",
  },
  {
    name: "ackLiability",
    label:
      "I will receive and sign a separate liability waiver before my first training session.",
  },
  {
    name: "ackOpenCommunication",
    label:
      "I understand that exercise carries inherent risks, and I will communicate openly with my trainer about any pain, discomfort, or concerns during training.",
  },
];

export function SectionAcknowledgment() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<IntakeFormData>();

  return (
    <IntakeSectionCard
      number={10}
      title="Acknowledgment"
      hint="By submitting this form, I confirm that:"
    >
      <div className="flex flex-col gap-2">
        {acknowledgments.map((a) => (
          <Controller
            key={a.name}
            control={control}
            name={a.name}
            render={({ field, fieldState }) => {
              const checked = field.value === true;
              return (
                <button
                  type="button"
                  onClick={() => field.onChange(!checked)}
                  className={cn(
                    "flex items-start gap-3 rounded-btn px-3 py-3 border text-left text-sm transition-colors",
                    checked
                      ? "bg-card-hover border-accent-blue/60 text-text-primary"
                      : "bg-card/60 border-border-subtle/40 text-text-secondary",
                    fieldState.error && "border-accent-red/60",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "bg-accent-blue border-accent-blue"
                        : "border-border-subtle",
                    )}
                  >
                    {checked && <Check className="h-3.5 w-3.5 text-white" />}
                  </span>
                  <span>{a.label}</span>
                </button>
              );
            }}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Name"
          hint="Auto-filled from above; edit if needed"
          required
          {...register("acknowledgedName")}
          error={errors.acknowledgedName?.message}
        />
        <TextField
          label="Date"
          hint="Today; edit to match form date if different"
          required
          type="date"
          {...register("acknowledgedDate")}
          error={errors.acknowledgedDate?.message}
        />
      </div>
    </IntakeSectionCard>
  );
}
