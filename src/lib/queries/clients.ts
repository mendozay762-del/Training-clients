import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  clients,
  clientIntake,
  clientMessages,
  bodyStats,
  workouts,
  workoutExercises,
  workoutSets,
  sessions,
  goals,
  nutritionNotes,
} from "@/db/schema";

export async function listClients() {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      active: clients.active,
      lastWorkoutOn: sql<string | null>`(
        select ${workouts.performedOn}
        from ${workouts}
        where ${workouts.clientId} = ${clients.id}
        order by ${workouts.performedOn} desc
        limit 1
      )`,
      nextSessionAt: sql<Date | null>`(
        select ${sessions.startsAt}
        from ${sessions}
        where ${sessions.clientId} = ${clients.id}
          and ${sessions.startsAt} >= now()
          and ${sessions.status} = 'scheduled'
        order by ${sessions.startsAt} asc
        limit 1
      )`,
      openActionCount: sql<number>`(
        select count(*)::int
        from ${clientMessages}
        where ${clientMessages.clientId} = ${clients.id}
          and ${clientMessages.actionItem} is not null
          and ${clientMessages.actionDone} = false
      )`,
    })
    .from(clients)
    .where(eq(clients.active, true))
    .orderBy(desc(clients.createdAt));

  return rows;
}

export async function getClient(id: string) {
  const rows = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getClientDetail(id: string) {
  const client = await getClient(id);
  if (!client) return null;

  const [statsRow] = await db
    .select()
    .from(bodyStats)
    .where(eq(bodyStats.clientId, id))
    .orderBy(desc(bodyStats.weekStart))
    .limit(1);

  const [prevStatsRow] = await db
    .select()
    .from(bodyStats)
    .where(
      and(
        eq(bodyStats.clientId, id),
        statsRow
          ? sql`${bodyStats.weekStart} < ${statsRow.weekStart}`
          : sql`true`,
      ),
    )
    .orderBy(desc(bodyStats.weekStart))
    .limit(1);

  const goalRows = await db
    .select()
    .from(goals)
    .where(eq(goals.clientId, id))
    .orderBy(goals.done, desc(goals.createdAt))
    .limit(5);

  const upcomingSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.clientId, id),
        gte(sessions.startsAt, new Date()),
        eq(sessions.status, "scheduled"),
      ),
    )
    .orderBy(sessions.startsAt)
    .limit(3);

  const latestNutrition = await db
    .select()
    .from(nutritionNotes)
    .where(eq(nutritionNotes.clientId, id))
    .orderBy(desc(nutritionNotes.noteDate), desc(nutritionNotes.createdAt))
    .limit(2);

  const recentWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.clientId, id))
    .orderBy(desc(workouts.performedOn))
    .limit(3);

  const [waiverRow] = await db
    .select({
      waiverVersion: clientIntake.waiverVersion,
      waiverAcceptedAt: clientIntake.waiverAcceptedAt,
    })
    .from(clientIntake)
    .where(eq(clientIntake.clientId, id))
    .limit(1);

  const recentMessages = await db
    .select()
    .from(clientMessages)
    .where(eq(clientMessages.clientId, id))
    .orderBy(desc(clientMessages.occurredAt))
    .limit(2);

  const [openActionRow] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(clientMessages)
    .where(
      and(
        eq(clientMessages.clientId, id),
        eq(clientMessages.actionDone, false),
        sql`${clientMessages.actionItem} is not null`,
      ),
    );

  return {
    client,
    latestStats: statsRow ?? null,
    prevStats: prevStatsRow ?? null,
    goals: goalRows,
    upcomingSessions,
    latestNutrition,
    recentWorkouts,
    recentMessages,
    openActionCount: openActionRow?.count ?? 0,
    waiver: {
      version: waiverRow?.waiverVersion ?? null,
      acceptedAt: waiverRow?.waiverAcceptedAt ?? null,
    },
  };
}

export async function listMessages(clientId: string) {
  return db
    .select()
    .from(clientMessages)
    .where(eq(clientMessages.clientId, clientId))
    .orderBy(desc(clientMessages.occurredAt));
}

export async function listWorkouts(clientId: string) {
  const rows = await db
    .select({
      id: workouts.id,
      performedOn: workouts.performedOn,
      notes: workouts.notes,
      exerciseCount: sql<number>`(
        select count(*)::int
        from ${workoutExercises}
        where ${workoutExercises.workoutId} = ${workouts.id}
      )`,
      setCount: sql<number>`(
        select count(*)::int
        from ${workoutSets}
        inner join ${workoutExercises}
          on ${workoutSets.exerciseId} = ${workoutExercises.id}
        where ${workoutExercises.workoutId} = ${workouts.id}
      )`,
    })
    .from(workouts)
    .where(eq(workouts.clientId, clientId))
    .orderBy(desc(workouts.performedOn), desc(workouts.createdAt));
  return rows;
}

export async function getWorkoutDetail(workoutId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId))
    .limit(1);
  if (!workout) return null;

  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position));

  const exerciseIds = exercises.map((e) => e.id);
  const sets = exerciseIds.length
    ? await db
        .select()
        .from(workoutSets)
        .where(
          sql`${workoutSets.exerciseId} in ${exerciseIds}`,
        )
        .orderBy(asc(workoutSets.setIndex))
    : [];

  return {
    workout,
    exercises: exercises.map((ex) => ({
      ...ex,
      sets: sets.filter((s) => s.exerciseId === ex.id),
    })),
  };
}

export async function listBodyStats(clientId: string) {
  return db
    .select()
    .from(bodyStats)
    .where(eq(bodyStats.clientId, clientId))
    .orderBy(desc(bodyStats.weekStart));
}

export async function listGoals(clientId: string) {
  return db
    .select()
    .from(goals)
    .where(eq(goals.clientId, clientId))
    .orderBy(goals.done, desc(goals.createdAt));
}

export async function listNutritionNotes(clientId: string) {
  return db
    .select()
    .from(nutritionNotes)
    .where(eq(nutritionNotes.clientId, clientId))
    .orderBy(desc(nutritionNotes.noteDate), desc(nutritionNotes.createdAt));
}

export async function getNextSessionAcrossClients() {
  const rows = await db
    .select({
      id: sessions.id,
      startsAt: sessions.startsAt,
      location: sessions.location,
      clientId: sessions.clientId,
      clientName: clients.name,
    })
    .from(sessions)
    .innerJoin(clients, eq(sessions.clientId, clients.id))
    .where(
      and(gte(sessions.startsAt, new Date()), eq(sessions.status, "scheduled")),
    )
    .orderBy(sessions.startsAt)
    .limit(1);
  return rows[0] ?? null;
}

export async function getWeekSummary() {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [{ total } = { total: 0 }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(clients)
    .where(eq(clients.active, true));

  const loggedRows = await db
    .selectDistinct({ clientId: workouts.clientId })
    .from(workouts)
    .where(gte(workouts.performedOn, weekAgo.toISOString().slice(0, 10)));

  return {
    totalClients: total,
    loggedThisWeek: loggedRows.length,
  };
}
