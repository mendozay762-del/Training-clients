import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { todayInAppTz } from "@/lib/utils";
import { formatRepsRange, formatRirRange } from "@/lib/prescription-format";
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
  prescribedSets,
} from "@/db/schema";
import type { PrescribedExercise, PrescribedSet } from "@/db/schema";

export async function listClients() {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      active: clients.active,
    })
    .from(clients)
    .where(eq(clients.active, true))
    .orderBy(desc(clients.createdAt));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const [lastWorkouts, nextSessions, openActions] = await Promise.all([
    db
      .select({
        clientId: workouts.clientId,
        lastWorkoutOn: sql<string | null>`max(${workouts.performedOn})`,
      })
      .from(workouts)
      .where(inArray(workouts.clientId, ids))
      .groupBy(workouts.clientId),
    db
      .select({
        clientId: sessions.clientId,
        nextSessionAt: sql<Date | null>`min(${sessions.startsAt})`,
      })
      .from(sessions)
      .where(
        and(
          inArray(sessions.clientId, ids),
          gte(sessions.startsAt, new Date()),
          eq(sessions.status, "scheduled"),
        ),
      )
      .groupBy(sessions.clientId),
    db
      .select({
        clientId: clientMessages.clientId,
        count: sql<number>`count(*)::int`,
      })
      .from(clientMessages)
      .where(
        and(
          inArray(clientMessages.clientId, ids),
          eq(clientMessages.actionDone, false),
          sql`${clientMessages.actionItem} is not null`,
        ),
      )
      .groupBy(clientMessages.clientId),
  ]);

  const lastMap = new Map(lastWorkouts.map((r) => [r.clientId, r.lastWorkoutOn]));
  const nextMap = new Map(nextSessions.map((r) => [r.clientId, r.nextSessionAt]));
  const actionMap = new Map(openActions.map((r) => [r.clientId, r.count]));

  return rows.map((r) => ({
    ...r,
    lastWorkoutOn: lastMap.get(r.id) ?? null,
    nextSessionAt: nextMap.get(r.id) ?? null,
    openActionCount: actionMap.get(r.id) ?? 0,
  }));
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

  const [
    prevStatsRows,
    goalRows,
    upcomingSessions,
    latestNutrition,
    recentWorkouts,
    waiverRows,
    recentMessages,
    openActionRows,
  ] = await Promise.all([
    db
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
      .limit(1),
    db
      .select()
      .from(goals)
      .where(eq(goals.clientId, id))
      .orderBy(goals.done, desc(goals.createdAt))
      .limit(5),
    db
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
      .limit(3),
    db
      .select()
      .from(nutritionNotes)
      .where(eq(nutritionNotes.clientId, id))
      .orderBy(desc(nutritionNotes.noteDate), desc(nutritionNotes.createdAt))
      .limit(2),
    db
      .select()
      .from(workouts)
      .where(eq(workouts.clientId, id))
      .orderBy(desc(workouts.performedOn))
      .limit(3),
    db
      .select({
        waiverVersion: clientIntake.waiverVersion,
        waiverAcceptedAt: clientIntake.waiverAcceptedAt,
      })
      .from(clientIntake)
      .where(eq(clientIntake.clientId, id))
      .limit(1),
    db
      .select()
      .from(clientMessages)
      .where(eq(clientMessages.clientId, id))
      .orderBy(desc(clientMessages.occurredAt))
      .limit(2),
    db
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
      ),
  ]);

  const prevStatsRow = prevStatsRows[0];
  const waiverRow = waiverRows[0];
  const openActionRow = openActionRows[0];

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
    })
    .from(workouts)
    .where(eq(workouts.clientId, clientId))
    .orderBy(desc(workouts.performedOn), desc(workouts.createdAt));

  if (rows.length === 0) return [];

  const workoutIds = rows.map((r) => r.id);

  const exerciseCounts = await db
    .select({
      workoutId: workoutExercises.workoutId,
      count: sql<number>`count(*)::int`,
    })
    .from(workoutExercises)
    .where(inArray(workoutExercises.workoutId, workoutIds))
    .groupBy(workoutExercises.workoutId);

  const setCounts = await db
    .select({
      workoutId: workoutExercises.workoutId,
      count: sql<number>`count(*)::int`,
    })
    .from(workoutSets)
    .innerJoin(workoutExercises, eq(workoutSets.exerciseId, workoutExercises.id))
    .where(inArray(workoutExercises.workoutId, workoutIds))
    .groupBy(workoutExercises.workoutId);

  const exerciseMap = new Map(exerciseCounts.map((e) => [e.workoutId, e.count]));
  const setMap = new Map(setCounts.map((s) => [s.workoutId, s.count]));

  return rows.map((r) => ({
    ...r,
    exerciseCount: exerciseMap.get(r.id) ?? 0,
    setCount: setMap.get(r.id) ?? 0,
  }));
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

  // If this session was started from a prescription, load the planned
  // targets so each set can show its suggested rep range and RIR.
  const [prescription] = await db
    .select({ id: prescribedWorkouts.id })
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.actualWorkoutId, workoutId))
    .limit(1);

  let pExercises: PrescribedExercise[] = [];
  let pSets: PrescribedSet[] = [];
  if (prescription) {
    pExercises = await db
      .select()
      .from(prescribedExercises)
      .where(eq(prescribedExercises.prescribedWorkoutId, prescription.id))
      .orderBy(asc(prescribedExercises.orderIndex));
    const peIds = pExercises.map((e) => e.id);
    pSets = peIds.length
      ? await db
          .select()
          .from(prescribedSets)
          .where(inArray(prescribedSets.prescribedExerciseId, peIds))
      : [];
  }

  const norm = (s: string) => s.trim().toLowerCase();
  const peByOrder = new Map<number, PrescribedExercise>();
  const peByName = new Map<string, PrescribedExercise>();
  for (const pe of pExercises) {
    peByOrder.set(pe.orderIndex, pe);
    if (!peByName.has(norm(pe.exerciseName))) peByName.set(norm(pe.exerciseName), pe);
  }
  const psByKey = new Map<string, PrescribedSet>();
  for (const ps of pSets) {
    psByKey.set(`${ps.prescribedExerciseId}:${ps.setIndex}`, ps);
  }

  // Sessions are created in prescribed order, so position usually equals
  // orderIndex; fall back to name match so it survives reordering.
  function matchExercise(
    name: string,
    position: number,
  ): PrescribedExercise | null {
    const byOrder = peByOrder.get(position);
    if (byOrder && norm(byOrder.exerciseName) === norm(name)) return byOrder;
    return peByName.get(norm(name)) ?? byOrder ?? null;
  }

  function suggestion(pe: PrescribedExercise | null, setIndex: number) {
    if (!pe) return { suggestedReps: null, suggestedRir: null };
    const ps = psByKey.get(`${pe.id}:${setIndex}`);
    if (ps) {
      return {
        suggestedReps: formatRepsRange(ps.repsLow, ps.repsHigh, ps.repsText),
        suggestedRir: formatRirRange(ps.rirLow, ps.rirHigh),
      };
    }
    return {
      suggestedReps: formatRepsRange(pe.repsLow, pe.repsHigh, pe.repsText),
      suggestedRir: formatRirRange(pe.rirLow, pe.rirHigh),
    };
  }

  return {
    workout,
    // Whether this logged session is already attached to a program day.
    inProgram: Boolean(prescription),
    exercises: exercises.map((ex) => {
      const pe = matchExercise(ex.exerciseName, ex.position);
      return {
        ...ex,
        sets: sets
          .filter((s) => s.exerciseId === ex.id)
          .map((s) => ({ ...s, ...suggestion(pe, s.setIndex) })),
      };
    }),
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
  const weekAgo = new Date(`${todayInAppTz()}T00:00:00Z`);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

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
  const rows = await db
    .select({
      id: trainingBlocks.id,
      name: trainingBlocks.name,
      style: trainingBlocks.style,
      status: trainingBlocks.status,
      startDate: trainingBlocks.startDate,
      endDate: trainingBlocks.endDate,
      weeklySplitSummary: trainingBlocks.weeklySplitSummary,
      updatedAt: trainingBlocks.updatedAt,
    })
    .from(trainingBlocks)
    .where(eq(trainingBlocks.clientId, clientId))
    .orderBy(
      sql`case ${trainingBlocks.status} when 'active' then 0 when 'draft' then 1 else 2 end`,
      desc(trainingBlocks.startDate),
      desc(trainingBlocks.createdAt),
    );

  if (rows.length === 0) return [];

  const blockIds = rows.map((r) => r.id);
  const counts = await db
    .select({
      blockId: prescribedWorkouts.blockId,
      count: sql<number>`count(*)::int`,
    })
    .from(prescribedWorkouts)
    .where(inArray(prescribedWorkouts.blockId, blockIds))
    .groupBy(prescribedWorkouts.blockId);

  const countMap = new Map(counts.map((c) => [c.blockId, c.count]));
  return rows.map((r) => ({ ...r, workoutCount: countMap.get(r.id) ?? 0 }));
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

  const prescribedRows = await db
    .select({
      id: prescribedWorkouts.id,
      prescribedFor: prescribedWorkouts.prescribedFor,
      mesocycle: prescribedWorkouts.mesocycle,
      name: prescribedWorkouts.name,
      status: prescribedWorkouts.status,
      actualWorkoutId: prescribedWorkouts.actualWorkoutId,
    })
    .from(prescribedWorkouts)
    .where(eq(prescribedWorkouts.blockId, blockId))
    .orderBy(asc(prescribedWorkouts.prescribedFor));

  const ids = prescribedRows.map((p) => p.id);
  const counts = ids.length
    ? await db
        .select({
          prescribedWorkoutId: prescribedExercises.prescribedWorkoutId,
          count: sql<number>`count(*)::int`,
        })
        .from(prescribedExercises)
        .where(inArray(prescribedExercises.prescribedWorkoutId, ids))
        .groupBy(prescribedExercises.prescribedWorkoutId)
    : [];

  const countMap = new Map(counts.map((c) => [c.prescribedWorkoutId, c.count]));
  const prescribed = prescribedRows.map((p) => ({
    ...p,
    exerciseCount: countMap.get(p.id) ?? 0,
  }));

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

  // If a session was logged for this day, load the actual performed data so
  // the program day can show real sets/reps — not just the (possibly empty) plan.
  const logged = workout.actualWorkoutId
    ? await loadLoggedSession(workout.actualWorkoutId)
    : null;

  return { workout, exercises, logged };
}

async function loadLoggedSession(actualWorkoutId: string) {
  const loggedExercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, actualWorkoutId))
    .orderBy(asc(workoutExercises.position));
  const exIds = loggedExercises.map((e) => e.id);
  const loggedSets = exIds.length
    ? await db
        .select()
        .from(workoutSets)
        .where(inArray(workoutSets.exerciseId, exIds))
        .orderBy(asc(workoutSets.setIndex))
    : [];
  return {
    workoutId: actualWorkoutId,
    exercises: loggedExercises.map((ex) => ({
      id: ex.id,
      exerciseName: ex.exerciseName,
      sets: loggedSets.filter((s) => s.exerciseId === ex.id),
    })),
  };
}

export async function getTodaysPrescription(clientId: string) {
  const today = todayInAppTz();
  const [row] = await db
    .select({
      id: prescribedWorkouts.id,
      blockId: prescribedWorkouts.blockId,
      name: prescribedWorkouts.name,
      status: prescribedWorkouts.status,
      prescribedFor: prescribedWorkouts.prescribedFor,
      actualWorkoutId: prescribedWorkouts.actualWorkoutId,
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
  if (!row) return null;

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(prescribedExercises)
    .where(eq(prescribedExercises.prescribedWorkoutId, row.id));

  return { ...row, exerciseCount: countRow?.count ?? 0 };
}
