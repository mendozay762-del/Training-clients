import { PageHeader } from "@/components/nav/page-header";
import { IntakeForm } from "@/components/intake/intake-form";
import { createClientFromIntake } from "@/lib/actions/intake";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New client" back="/clients" />
      <div className="px-4 pt-3">
        <IntakeForm onSubmit={createClientFromIntake} />
      </div>
    </>
  );
}
