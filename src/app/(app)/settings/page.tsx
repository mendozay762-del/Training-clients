import { PageHeader } from "@/components/nav/page-header";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div className="flex flex-col gap-3 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            App
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-text-primary">Theme</span>
            <span className="text-text-tertiary">Dark</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-text-primary">Version</span>
            <span className="text-text-tertiary tabnums">0.1.0 · M1</span>
          </div>
        </section>

        <p className="px-2 text-center text-xs text-text-tertiary">
          Sign-out and account management arrive in milestone 4.
        </p>
      </div>
    </>
  );
}
