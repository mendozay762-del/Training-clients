"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { IntakeForm } from "./intake-form";
import { QuestionnaireViewer } from "./questionnaire-viewer";
import { createClientFromIntake } from "@/lib/actions/intake";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

export function IntakeWithViewer() {
  const [overlayOpen, setOverlayOpen] = useState(false);

  useBodyScrollLock(overlayOpen);

  return (
    <>
      <div className="grid gap-4 px-4 pt-3 md:grid-cols-[minmax(0,1fr)_minmax(320px,40%)]">
        <div>
          <button
            type="button"
            onClick={() => setOverlayOpen(true)}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-btn bg-card px-4 py-2.5 text-sm font-medium hover:bg-card-hover md:hidden"
          >
            <FileText className="h-4 w-4" />
            View questionnaire
          </button>
          <IntakeForm onSubmit={createClientFromIntake} />
        </div>
        <aside className="hidden md:block">
          <div className="sticky top-3 h-[calc(100dvh-5rem)]">
            <QuestionnaireViewer className="h-full" />
          </div>
        </aside>
      </div>

      {overlayOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-base md:hidden"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingLeft: "env(safe-area-inset-left)",
            paddingRight: "env(safe-area-inset-right)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <header className="flex items-center justify-between border-b border-subtle px-4 py-3">
            <h2 className="text-base font-semibold">Questionnaire</h2>
            <button
              type="button"
              onClick={() => setOverlayOpen(false)}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-btn bg-card-hover/40 hover:bg-card-hover"
            >
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="flex-1 overflow-hidden p-3">
            <QuestionnaireViewer className="h-full" />
          </div>
        </div>
      )}
    </>
  );
}
