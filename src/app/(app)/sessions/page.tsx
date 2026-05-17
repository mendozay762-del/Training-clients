import { PageHeader } from "@/components/nav/page-header";

export default function SessionsPage() {
  return (
    <>
      <PageHeader title="Sessions" />
      <div className="p-4">
        <div className="rounded-card bg-card p-8 text-center">
          <p className="text-text-secondary">
            Sessions arrive in milestone 2.
          </p>
          <p className="mt-2 text-sm text-text-tertiary">
            You&apos;ll schedule appointments and log post-session notes here.
          </p>
        </div>
      </div>
    </>
  );
}
