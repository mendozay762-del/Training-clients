export type SheetRow = {
  line: number;
  prescribedFor: string;
  workoutName: string | null;
  exerciseName: string;
  sets: number | null;
  repsLow: number | null;
  repsHigh: number | null;
  repsText: string | null;
  loadLbs: number | null;
  loadPct1rm: number | null;
  loadText: string | null;
  rpeTarget: number | null;
  rirTarget: number | null;
  notes: string | null;
};

export type SheetParseError = {
  line: number;
  column: string;
  message: string;
  raw: string;
};

export type SheetParseResult = {
  rows: SheetRow[];
  errors: SheetParseError[];
  totalLines: number;
};

const REQUIRED_HEADERS = ["prescribed_for", "exercise_name"] as const;
const KNOWN_HEADERS = [
  "prescribed_for",
  "workout_name",
  "exercise_name",
  "sets",
  "reps",
  "load",
  "rpe",
  "rir",
  "notes",
] as const;

type HeaderMap = Partial<Record<(typeof KNOWN_HEADERS)[number], number>>;

export function parseSheetPaste(input: string): SheetParseResult {
  const errors: SheetParseError[] = [];
  const rows: SheetRow[] = [];

  const allLines = input.replace(/\r\n/g, "\n").split("\n");
  const nonEmptyLines = allLines
    .map((raw, idx) => ({ raw, idx: idx + 1 }))
    .filter((l) => l.raw.trim().length > 0);

  if (nonEmptyLines.length === 0) {
    return { rows: [], errors: [], totalLines: 0 };
  }

  const header = nonEmptyLines[0];
  const headerMap = parseHeader(header.raw);
  if (!headerMap) {
    errors.push({
      line: header.idx,
      column: "header",
      message: `Header row must include: ${REQUIRED_HEADERS.join(", ")}.`,
      raw: header.raw,
    });
    return { rows, errors, totalLines: nonEmptyLines.length };
  }

  for (const { raw, idx } of nonEmptyLines.slice(1)) {
    const cells = splitRow(raw);
    const row = parseDataRow(cells, headerMap, idx, errors);
    if (row) rows.push(row);
  }

  return { rows, errors, totalLines: nonEmptyLines.length };
}

function splitRow(raw: string): string[] {
  return raw.includes("\t") ? raw.split("\t") : raw.split(",");
}

function normalizeHeader(s: string): string {
  return s.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseHeader(raw: string): HeaderMap | null {
  const cells = splitRow(raw).map(normalizeHeader);
  const map: HeaderMap = {};
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if ((KNOWN_HEADERS as readonly string[]).includes(cell)) {
      map[cell as (typeof KNOWN_HEADERS)[number]] = i;
    }
  }
  for (const required of REQUIRED_HEADERS) {
    if (map[required] === undefined) return null;
  }
  return map;
}

function cell(
  cells: string[],
  map: HeaderMap,
  key: (typeof KNOWN_HEADERS)[number],
): string {
  const i = map[key];
  if (i === undefined) return "";
  return (cells[i] ?? "").trim();
}

function parseDataRow(
  cells: string[],
  map: HeaderMap,
  line: number,
  errors: SheetParseError[],
): SheetRow | null {
  const dateRaw = cell(cells, map, "prescribed_for");
  const exerciseName = cell(cells, map, "exercise_name");

  if (!dateRaw && !exerciseName) return null;

  const isoDate = parseDate(dateRaw);
  if (!isoDate) {
    errors.push({
      line,
      column: "prescribed_for",
      message: "Could not read this as a date (YYYY-MM-DD works best).",
      raw: dateRaw,
    });
    return null;
  }
  if (!exerciseName) {
    errors.push({
      line,
      column: "exercise_name",
      message: "Exercise name is required.",
      raw: cells.join("\t"),
    });
    return null;
  }

  const sets = parseIntCell(cell(cells, map, "sets"));
  if (sets.error)
    errors.push({ line, column: "sets", message: sets.error, raw: sets.raw });

  const reps = parseReps(cell(cells, map, "reps"));
  const load = parseLoad(cell(cells, map, "load"));

  const rpe = parseDecimalCell(cell(cells, map, "rpe"), 1, 10);
  if (rpe.error)
    errors.push({ line, column: "rpe", message: rpe.error, raw: rpe.raw });

  const rir = parseIntCell(cell(cells, map, "rir"), 0, 20);
  if (rir.error)
    errors.push({ line, column: "rir", message: rir.error, raw: rir.raw });

  return {
    line,
    prescribedFor: isoDate,
    workoutName: cell(cells, map, "workout_name") || null,
    exerciseName,
    sets: sets.value,
    repsLow: reps.low,
    repsHigh: reps.high,
    repsText: reps.text,
    loadLbs: load.lbs,
    loadPct1rm: load.pct,
    loadText: load.text,
    rpeTarget: rpe.value,
    rirTarget: rir.value,
    notes: cell(cells, map, "notes") || null,
  };
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return null;
  return new Date(t).toISOString().slice(0, 10);
}

type NumResult = { value: number | null; error: string | null; raw: string };
function parseIntCell(
  raw: string,
  min?: number,
  max?: number,
): NumResult {
  if (!raw) return { value: null, error: null, raw };
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n))
    return { value: null, error: `"${raw}" is not a whole number.`, raw };
  if (min !== undefined && n < min)
    return { value: null, error: `Must be ≥ ${min}.`, raw };
  if (max !== undefined && n > max)
    return { value: null, error: `Must be ≤ ${max}.`, raw };
  return { value: n, error: null, raw };
}

function parseDecimalCell(raw: string, min?: number, max?: number): NumResult {
  if (!raw) return { value: null, error: null, raw };
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n))
    return { value: null, error: `"${raw}" is not a number.`, raw };
  if (min !== undefined && n < min)
    return { value: null, error: `Must be ≥ ${min}.`, raw };
  if (max !== undefined && n > max)
    return { value: null, error: `Must be ≤ ${max}.`, raw };
  return { value: n, error: null, raw };
}

type RepsResult = {
  low: number | null;
  high: number | null;
  text: string | null;
};
function parseReps(raw: string): RepsResult {
  if (!raw) return { low: null, high: null, text: null };
  const range = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) {
    const lo = Number.parseInt(range[1], 10);
    const hi = Number.parseInt(range[2], 10);
    return { low: lo, high: hi, text: null };
  }
  const single = raw.match(/^(\d+)$/);
  if (single) {
    const n = Number.parseInt(single[1], 10);
    return { low: n, high: n, text: null };
  }
  return { low: null, high: null, text: raw };
}

type LoadResult = {
  lbs: number | null;
  pct: number | null;
  text: string | null;
};
function parseLoad(raw: string): LoadResult {
  if (!raw) return { lbs: null, pct: null, text: null };
  const pct = raw.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (pct) return { lbs: null, pct: Number.parseFloat(pct[1]), text: null };
  const lbs = raw.match(/^(\d+(?:\.\d+)?)\s*(?:lb|lbs)?$/i);
  if (lbs) return { lbs: Number.parseFloat(lbs[1]), pct: null, text: null };
  return { lbs: null, pct: null, text: raw };
}

export function groupRowsToWorkouts(rows: SheetRow[]): {
  prescribedFor: string;
  name: string | null;
  exercises: SheetRow[];
}[] {
  const map = new Map<string, SheetRow[]>();
  for (const row of rows) {
    const key = `${row.prescribedFor}::${row.workoutName ?? ""}`;
    const arr = map.get(key) ?? [];
    arr.push(row);
    map.set(key, arr);
  }
  return Array.from(map.entries())
    .map(([key, exercises]) => {
      const [prescribedFor, name] = key.split("::");
      return {
        prescribedFor,
        name: name || null,
        exercises,
      };
    })
    .sort((a, b) =>
      a.prescribedFor < b.prescribedFor
        ? -1
        : a.prescribedFor > b.prescribedFor
          ? 1
          : 0,
    );
}
