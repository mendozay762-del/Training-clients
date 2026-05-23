import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClient } from "@/lib/queries/clients";
import { startWorkout } from "@/lib/actions/workouts";
import { todayInAppTz } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NewWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const today = todayInAppTz();

  return (
    <>
      <PageHeader title="New workout" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <form action={startWorkout} className="flex flex-col gap-3 rounded-card bg-card p-4">
          <input type="hidden" name="clientId" value={id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="performedOn">Date</Label>
            <Input
              id="performedOn"
              name="performedOn"
              type="date"
              defaultValue={today}
              required
            />
          </div>
          <Button type="submit">Start session</Button>
          <p className="text-xs text-text-tertiary">
            You can add exercises and sets after starting.
          </p>
        </form>
      </div>
    </>
  );
}
