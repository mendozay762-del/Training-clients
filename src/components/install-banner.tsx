"use client";

import { useEffect, useState } from "react";
import { Share, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "install-banner-dismissed-v1";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error - iOS Safari only
    window.navigator.standalone === true
  );
}

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [showHow, setShowHow] = useState(false);

  useEffect(() => {
    if (!isIos() || isStandalone()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage blocked → still show
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  return (
    <>
      <div className="mx-4 mt-3 flex items-center gap-3 rounded-card border border-accent-blue/30 bg-accent-blue/10 p-3">
        <button
          type="button"
          onClick={() => setShowHow(true)}
          className="flex-1 text-left text-sm font-medium text-text-primary"
        >
          Install this app to your home screen →
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-card-hover/40 text-text-secondary hover:bg-card-hover hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {showHow && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 safe-pb"
          onClick={() => setShowHow(false)}
        >
          <div
            className={cn(
              "w-full max-w-md rounded-card bg-card p-5",
              "border border-border-subtle/40",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold">Install on your iPhone</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Three taps and the app lives on your home screen.
            </p>
            <ol className="mt-4 flex flex-col gap-3">
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-hover text-sm font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Tap <Share className="h-4 w-4 text-accent-blue" /> Share
                  </div>
                  <div className="text-xs text-text-tertiary">
                    In the Safari toolbar.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-hover text-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    Choose <Plus className="h-4 w-4 text-accent-blue" /> Add to
                    Home Screen
                  </div>
                  <div className="text-xs text-text-tertiary">
                    Scroll the share sheet if you don&apos;t see it.
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card-hover text-sm font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Tap Add</div>
                  <div className="text-xs text-text-tertiary">
                    The icon appears with the rest of your apps.
                  </div>
                </div>
              </li>
            </ol>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowHow(false)}
                className="flex-1 rounded-btn bg-card-hover py-3 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  dismiss();
                  setShowHow(false);
                }}
                className="flex-1 rounded-btn bg-accent-blue py-3 text-sm font-medium text-white"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
