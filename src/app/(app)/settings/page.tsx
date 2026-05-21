import { PageHeader } from "@/components/nav/page-header";
import { logout } from "@/lib/actions/auth";

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

        <section className="rounded-card bg-card p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-text-secondary">
            Account
          </div>
          <form action={logout} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-btn bg-card-hover/40 px-4 py-2.5 text-sm font-medium text-accent-red hover:bg-card-hover"
            >
              Sign out
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
