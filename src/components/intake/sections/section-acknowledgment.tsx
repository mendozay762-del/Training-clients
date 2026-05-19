"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Check } from "lucide-react";
import { IntakeSectionCard } from "../intake-section-card";
import { TextField } from "../fields/text-field";
import { cn } from "@/lib/utils";
import type { IntakeFormData } from "@/lib/schemas/client-intake";
import {
  WAIVER_DRAFT_NOTICE,
  WAIVER_SECTIONS,
  WAIVER_TITLE,
} from "@/lib/waiver-text";

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
      "I have read the liability waiver above, I understand its terms, and I accept them.",
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
      <div className="flex flex-col gap-3 rounded-btn border border-border-subtle/40 bg-card/60 p-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Liability waiver
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            {WAIVER_TITLE}
          </h3>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-btn border border-border-subtle/40 bg-card p-4 text-sm leading-relaxed text-text-secondary">
          <div className="flex flex-col gap-3">
            {WAIVER_SECTIONS.map((section) => (
              <div key={section.heading} className="flex flex-col gap-1">
                <div className="font-semibold text-text-primary">
                  {section.heading}
                </div>
                {section.body.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs italic text-text-secondary">
          {WAIVER_DRAFT_NOTICE}
        </p>
      </div>
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
          hint="Client's full legal name as it should appear on the signed waiver"
          {...register("acknowledgedName")}
          error={errors.acknowledgedName?.message}
        />
        <TextField
          label="Date"
          hint="Today; edit to match form date if different"
          type="date"
          {...register("acknowledgedDate")}
          error={errors.acknowledgedDate?.message}
        />
      </div>
    </IntakeSectionCard>
  );
}
