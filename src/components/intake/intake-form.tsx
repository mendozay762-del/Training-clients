"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  intakeFormSchema,
  type IntakeFormData,
} from "@/lib/schemas/client-intake";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";
import { Section1Personal } from "./sections/section-1-personal";
import { Section2Logistics } from "./sections/section-2-logistics";
import { Section3Goals } from "./sections/section-3-goals";
import { Section4History } from "./sections/section-4-history";
import { Section5Preferences } from "./sections/section-5-preferences";
import { Section6Health } from "./sections/section-6-health";
import { Section7Lifestyle } from "./sections/section-7-lifestyle";
import { Section8Nutrition } from "./sections/section-8-nutrition";
import { Section9Final } from "./sections/section-9-final";
import { SectionAcknowledgment } from "./sections/section-acknowledgment";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface IntakeFormProps {
  defaultValues?: Partial<IntakeFormData>;
  onSubmit: (data: IntakeFormData) => Promise<{ ok: true; clientId: string } | { ok: false; error: string }>;
  submitLabel?: string;
}

export function IntakeForm({
  defaultValues,
  onSubmit,
  submitLabel = "Create Client",
}: IntakeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const keyboardInset = useKeyboardInset();

  const methods = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      measureProgress: [],
      gymAccess: [],
      daysPerWeek: [],
      sessionLengthMin: [],
      commPreference: [],
      splitPreference: [],
      workActivity: [],
      dietaryPattern: [],
      sharesMeasurements: false,
      acknowledgedDate: todayIso(),
      ...defaultValues,
    },
    mode: "onSubmit",
  });

  const name = methods.watch("name");
  const acknowledgedName = methods.watch("acknowledgedName");

  useEffect(() => {
    if (name && !acknowledgedName) {
      methods.setValue("acknowledgedName", name, { shouldValidate: false });
    }
  }, [name, acknowledgedName, methods]);

  function handleSubmit(data: IntakeFormData) {
    setSubmitError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      if (result.ok) {
        router.push(`/clients/${result.clientId}`);
      } else {
        setSubmitError(result.error);
      }
    });
  }

  function handleInvalid() {
    setSubmitError(
      "Please fix the highlighted fields. Required questions are marked with a red asterisk.",
    );
    setTimeout(() => {
      const first = document.querySelector("[aria-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit, handleInvalid)}
        className="flex flex-col gap-3 pb-32"
      >
        <Section1Personal />
        <Section2Logistics />
        <Section3Goals />
        <Section4History />
        <Section5Preferences />
        <Section6Health />
        <Section7Lifestyle />
        <Section8Nutrition />
        <Section9Final />
        <SectionAcknowledgment />

        {submitError && (
          <div className="rounded-card border border-accent-red/40 bg-accent-red/5 p-3 text-sm text-accent-red">
            {submitError}
          </div>
        )}

        <div
          className="fixed left-0 right-0 z-30 border-t border-subtle bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-base/85 safe-pb"
          style={{
            bottom: keyboardInset > 0 ? keyboardInset : 0,
            transition: "bottom 120ms ease-out",
          }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-button bg-accent-blue text-base font-semibold text-white transition-colors hover:bg-accent-blue/90 disabled:opacity-50"
            >
              {isPending ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
