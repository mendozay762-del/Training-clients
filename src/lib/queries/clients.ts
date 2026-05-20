import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
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
  trainingBlocks,
  prescribedWorkouts,
  prescribedExercises,
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
        .where(inArray(workoutSets.exerciseId, exerciseIds))
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

export async function listSessions(clientId: string) {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.clientId, clientId))
    .orderBy(desc(sessions.startsAt));
}

export async function getSession(sessionId: string) {
  const [row] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return row ?? null;
}

export type ClientPr = {
  exerciseName: string;
  weightLbs: number;
  reps: number;
  e1rm: number;
  performedOn: string;
};

export async function listClientPRs(clientId: string): Promise<ClientPr[]> {
  const rows = await db.execute<{
    exercise_name: string;
    weight_lbs: string;
    reps: number;
    e1rm: string;
    performed_on: string;
  }>(sql`
    select distinct on (lower(${workoutExercises.exerciseName}))
      ${workoutExercises.exerciseName} as exercise_name,
      ${workoutSets.weightLbs} as weight_lbs,
      ${workoutSets.reps} as reps,
      (${workoutSets.weightLbs} * (1 + ${workoutSets.reps}::numeric / 30)) as e1rm,
      ${workouts.performedOn} as performed_on
    from ${workoutSets}
    inner join ${workoutExercises} on ${workoutSets.exerciseId} = ${workoutExercises.id}
    inner join ${workouts} on ${workoutExercises.workoutId} = ${workouts.id}
    where ${workouts.clientId} = ${clientId}
      and ${workoutSets.isWarmup} = false
      and ${workoutSets.weightLbs} is not null
      and ${workoutSets.reps} > 0
    order by
      lower(${workoutExercises.exerciseName}),
      (${workoutSets.weightLbs} * (1 + ${workoutSets.reps}::numeric / 30)) desc,
      ${workouts.performedOn} desc
  `);

  return rows.rows.map((r) => ({
    exerciseName: r.exercise_name,
    weightLbs: Number(r.weight_lbs),
    reps: r.reps,
    e1rm: Number(r.e1rm),
    performedOn: r.performed_on,
  }));
}

export type E1rmPoint = {
  exerciseName: string;
  performedOn: string;
  e1rm: number;
};

export async function listE1rmSeries(
  clientId: string,
  options: { days?: number; minSessions?: number; topN?: number } = {},
): Promise<E1rmPoint[]> {
  const { days = 180, minSessions = 3, topN = 4 } = options;

  const rows = await db.execute<{
    exercise_name: string;
    performed_on: string;
    best_e1rm: string;
    session_count: number;
  }>(sql`
    with per_session as (
      select
        ${workoutExercises.exerciseName} as exercise_name,
        lower(${workoutExercises.exerciseName}) as exercise_key,
        ${workouts.performedOn} as performed_on,
        max(${workoutSets.weightLbs} * (1 + ${workoutSets.reps}::numeric / 30)) as best_e1rm
      from ${workoutSets}
      inner join ${workoutExercises} on ${workoutSets.exerciseId} = ${workoutExercises.id}
      inner join ${workouts} on ${workoutExercises.workoutId} = ${workouts.id}
      where ${workouts.clientId} = ${clientId}
        and ${workoutSets.isWarmup} = false
        and ${workoutSets.weightLbs} is not null
        and ${workoutSets.reps} > 0
        and ${workouts.performedOn} >= (current_date - make_interval(days => ${days}::int))
      group by ${workoutExercises.exerciseName}, exercise_key, ${workouts.performedOn}
    ),
    exercise_freq as (
      select exercise_key, count(*) as session_count
      from per_session
      group by exercise_key
      having count(*) >= ${minSessions}::int
      order by count(*) desc, max(best_e1rm) desc
      limit ${topN}::int
    )
    select ps.exercise_name, ps.performed_on, ps.best_e1rm, ef.session_count
    from per_session ps
    inner join exercise_freq ef on ef.exercise_key = lower(ps.exercise_name)
    order by ps.performed_on asc, ps.exercise_name
  `);

  return rows.rows.map((r) => ({
    exerciseName: r.exercise_name,
    performedOn: r.performed_on,
    e1rm: Number(r.best_e1rm),
  }));
}

export type AdherenceWeek = {
  weekStart: string;
  completed: number;
  prescribed: number;
  skipped: number;
};

export async function listWorkoutsPerWeek(
  clientId: string,
  weeks = 12,
): Promise<AdherenceWeek[]> {
  const weeksBack = Math.max(0, weeks - 1);
  const rows = await db.execute<{
    week_start: string;
    completed: number;
    prescribed: number;
    skipped: number;
  }>(sql`
    select
      gs::date as week_start,
      coalesce(c.cnt, 0)::int as completed,
      coalesce(p.planned, 0)::int as prescribed,
      coalesce(p.skipped, 0)::int as skipped
    from generate_series(
      date_trunc('week', current_date) - make_interval(weeks => ${weeksBack}::int),
      date_trunc('week', current_date),
      interval '1 week'
    ) as gs
    left join (
      select date_trunc('week', ${workouts.performedOn}::timestamp)::date as week_start,
             count(*) as cnt
      from ${workouts}
      where ${workouts.clientId} = ${clientId}
      group by week_start
    ) c on c.week_start = gs::date
    left join (
      select
        date_trunc('week', ${prescribedWorkouts.prescribedFor}::timestamp)::date as week_start,
        count(*) filter (where ${prescribedWorkouts.status} <> 'skipped') as planned,
        count(*) filter (where ${prescribedWorkouts.status} = 'skipped') as skipped
      from ${prescribedWorkouts}
      where ${prescribedWorkouts.clientId} = ${clientId}
      group by week_start
    ) p on p.week_start = gs::date
    order by gs
  `);

  return rows.rows.map((r) => ({
    weekStart: r.week_start,
    completed: Number(r.completed),
    prescribed: Number(r.prescribed),
    skipped: Number(r.skipped),
  }));
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

export async function listBlocks(clientId: string) {
  return db
    .select({
      id: trainingBlocks.id,
      name: trainingBlocks.name,
      style: trainingBlocks.style,
      status: trainingBlocks.status,
      startDate: trainingBlocks.startDate,
      endDate: trainingBlocks.endDate,
      weeklySplitSummary: trainingBlocks.weeklySplitSummary,
      updatedAt: trainingBlocks.updatedAt,
      workoutCount: sql<number>`(
        select count(*)::int
        from ${prescribedWorkouts}
        where ${prescribedWorkouts.blockId} = ${trainingBlocks.id}
      )`,
    })
    .from(trainingBlocks)
    .where(eq(trainingBlocks.clientId, clientId))
    .orderBy(
      sql`case ${trainingBlocks.status} when 'active' then 0 when 'draft' then 1 else 2 end`,
      desc(trainingBlocks.startDate),
      desc(trainingBlocks.createdAt),
    );
}

export async function getBlock(blockId: string) {
  const [row] = await db
    .select()
    .from(trainingBlocks)
    .where(eq(trainingBlocks.id, blockId))
    .limit(1);
  return row ?? null;
}

export async function getBlockDetail(blockId: string) {
  const block = await getBlock(blockId);
  if (!block) return null;

  const prescribed = await db
    .select({
      id: prescribedWorkouts.id,
      prescribedFor: prescribedWorkouts.prescribedFor,
      name: prescribedWorkouts.name,
      status: prescribedWorkouts.status,
      actualWorkoutId: prescribedWorkouts.actualWorkoutId,
      exerciseCount: sql<number>`(
        select count(*)::int
        from ${prescribedExercises}
        where ${prescribedExercises.prescribedWorkoutId} = ${prescribedWorkouts.id}
      )`,
    })
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.blockId, blockId))
    .orderBy(asc(prescribedWorkouts.prescribedFor));

  return { block, prescribed };
}

export async function getPrescribedWorkoutDetail(workoutId: string) {
  const [workout] = await db
    .select()
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.id, workoutId))
    .limit(1);
  if (!workout) return null;

  const exercises = await db
    .select()
    .from(prescribedExercises)
    .where(eq(prescribedExercises.prescribedWorkoutId, workoutId))
    .orderBy(asc(prescribedExercises.orderIndex));

  return { workout, exercises };
}

export async function getTodaysPrescription(clientId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const [row] = await db
    .select({
      id: prescribedWorkouts.id,
      blockId: prescribedWorkouts.blockId,
      name: prescribedWorkouts.name,
      status: prescribedWorkouts.status,
      prescribedFor: prescribedWorkouts.prescribedFor,
      actualWorkoutId: prescribedWorkouts.actualWorkoutId,
      exerciseCount: sql<number>`(
        select count(*)::int
        from ${prescribedExercises}
        where ${prescribedExercises.prescribedWorkoutId} = ${prescribedWorkouts.id}
      )`,
    })
    .from(prescribedWorkouts)
    .where(
      and(
        eq(prescribedWorkouts.clientId, clientId),
        eq(prescribedWorkouts.prescribedFor, today),
      ),
    )
    .orderBy(prescribedWorkouts.createdAt)
    .limit(1);
  return row ?? null;
}
