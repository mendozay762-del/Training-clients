import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { NutritionForm } from "@/components/nutrition/nutrition-form";
import { DeleteNutritionButton } from "@/components/nutrition/delete-nutrition-button";
import { getClient, listNutritionNotes } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function ClientNutritionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, notes] = await Promise.all([
    getClient(id),
    listNutritionNotes(id),
  ]);
  if (!client) notFound();

  return (
    <>
      <PageHeader title="Nutrition" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            New note
          </div>
          <NutritionForm clientId={id} />
        </section>

        {notes.length === 0 ? (
          <p className="text-center text-sm text-text-tertiary">
            No notes yet.
          </p>
        ) : (
          <section className="rounded-card bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              History ({notes.length})
            </div>
            <ul className="flex flex-col gap-4">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wider text-text-tertiary tabnums">
                      {new Date(n.noteDate).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-text-primary">
                      {n.bodyMd}
                    </div>
                  </div>
                  <DeleteNutritionButton id={n.id} clientId={id} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
