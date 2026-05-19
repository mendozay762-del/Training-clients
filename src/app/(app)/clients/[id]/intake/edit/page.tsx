import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clients, clientIntake } from "@/db/schema";
import { PageHeader } from "@/components/nav/page-header";
import { IntakeForm } from "@/components/intake/intake-form";
import { updateClientFromIntake } from "@/lib/actions/intake";
import { formDefaultsFromDb } from "@/lib/intake-defaults";
import type { IntakeFormData } from "@/lib/schemas/client-intake";

export const dynamic = "force-dynamic";

export default async function EditIntakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, id))
    .limit(1);
  if (!client) notFound();
  const [intake] = await db
    .select()
    .from(clientIntake)
    .where(eq(clientIntake.clientId, id))
    .limit(1);

  const defaultValues = formDefaultsFromDb(client, intake);

  async function action(data: IntakeFormData) {
    "use server";
    return updateClientFromIntake(id, data);
  }

  return (
    <>
      <PageHeader title="Edit intake" back={`/clients/${id}`} />
      <div className="px-4 pt-3">
        <IntakeForm
          defaultValues={defaultValues}
          onSubmit={action}
          submitLabel="Save changes"
        />
      </div>
    </>
  );
}
