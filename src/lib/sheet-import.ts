export type PrescribedSetSpec = {
  setIndex: number;
  repsLow: number | null;
  repsHigh: number | null;
  repsText: string | null;
  rirLow: number | null;
  rirHigh: number | null;
};

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
  rirLow: number | null;
  rirHigh: number | null;
  // Per-set detail when reps/RIR vary across sets (e.g. "1-2 | 1-2 | 0-1").
  // Always populated when a set count is known so each set carries a target.
  perSet: PrescribedSetSpec[] | null;
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

  const load = parseLoad(cell(cells, map, "load"));

  const rpe = parseDecimalCell(cell(cells, map, "rpe"), 1, 10);
  if (rpe.error)
    errors.push({ line, column: "rpe", message: rpe.error, raw: rpe.raw });

  const prescription = parsePerSet(
    cell(cells, map, "reps"),
    cell(cells, map, "rir"),
    sets.value,
    line,
    errors,
  );

  return {
    line,
    prescribedFor: isoDate,
    workoutName: cell(cells, map, "workout_name") || null,
    exerciseName,
    sets: sets.value,
    repsLow: prescription.repsLow,
    repsHigh: prescription.repsHigh,
    repsText: prescription.repsText,
    loadLbs: load.lbs,
    loadPct1rm: load.pct,
    loadText: load.text,
    rpeTarget: rpe.value,
    rirTarget: prescription.rirTarget,
    rirLow: prescription.rirLow,
    rirHigh: prescription.rirHigh,
    perSet: prescription.perSet,
    notes: cell(cells, map, "notes") || null,
  };
}

// Splits a cell into per-set tokens on "|". A single token applies to all
// sets; N tokens map to sets 1..N in order.
function splitPerSet(raw: string): string[] {
  return raw
    .split("|")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

type RirToken = { low: number | null; high: number | null; error: string | null };
function parseRirToken(raw: string): RirToken {
  const range = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (range) {
    let lo = Number.parseInt(range[1], 10);
    let hi = Number.parseInt(range[2], 10);
    if (lo > hi) [lo, hi] = [hi, lo];
    if (hi > 20)
      return { low: null, high: null, error: `RIR "${raw}" is too high (max 20).` };
    return { low: lo, high: hi, error: null };
  }
  const single = raw.match(/^(\d+)$/);
  if (single) {
    const n = Number.parseInt(single[1], 10);
    if (n > 20)
      return { low: null, high: null, error: `RIR "${raw}" is too high (max 20).` };
    return { low: n, high: n, error: null };
  }
  return {
    low: null,
    high: null,
    error: `"${raw}" is not a valid RIR (use e.g. 2 or 0-1).`,
  };
}

type PerSetResult = {
  repsLow: number | null;
  repsHigh: number | null;
  repsText: string | null;
  rirLow: number | null;
  rirHigh: number | null;
  rirTarget: number | null;
  perSet: PrescribedSetSpec[] | null;
};

function parsePerSet(
  repsRaw: string,
  rirRaw: string,
  setsValue: number | null,
  line: number,
  errors: SheetParseError[],
): PerSetResult {
  const repsTokens = splitPerSet(repsRaw).map(parseReps);
  const rirTokens = splitPerSet(rirRaw).map(parseRirToken);
  for (const r of rirTokens)
    if (r.error) errors.push({ line, column: "rir", message: r.error, raw: rirRaw });

  // How many sets does this prescription describe?
  const tokenMax = Math.max(repsTokens.length, rirTokens.length);
  const setCount = setsValue ?? (tokenMax > 0 ? tokenMax : null);

  // A multi-value cell must match the set count exactly (single value broadcasts).
  if (setCount !== null) {
    if (repsTokens.length > 1 && repsTokens.length !== setCount)
      errors.push({
        line,
        column: "reps",
        message: `Expected ${setCount} reps value(s) — one per set — but found ${repsTokens.length}. Use one value for all sets, or one per set separated by "|".`,
        raw: repsRaw,
      });
    if (rirTokens.length > 1 && rirTokens.length !== setCount)
      errors.push({
        line,
        column: "rir",
        message: `Expected ${setCount} RIR value(s) — one per set — but found ${rirTokens.length}. Use one value for all sets, or one per set separated by "|".`,
        raw: rirRaw,
      });
  }

  // Exercise-level summary (envelope across sets), used on the program overview.
  const numericReps = repsTokens.filter((t) => t.low !== null);
  const repsLow = numericReps.length
    ? Math.min(...numericReps.map((t) => t.low as number))
    : null;
  const repsHigh = numericReps.length
    ? Math.max(...numericReps.map((t) => t.high as number))
    : null;
  const repsText = repsTokens.find((t) => t.text !== null)?.text ?? null;

  const validRir = rirTokens.filter((r) => r.error === null && r.low !== null);
  const rirLow = validRir.length
    ? Math.min(...validRir.map((r) => r.low as number))
    : null;
  const rirHigh = validRir.length
    ? Math.max(...validRir.map((r) => r.high as number))
    : null;
  // Keep the legacy single-int target only when one plain value was given.
  const rirTarget =
    rirTokens.length === 1 &&
    validRir.length === 1 &&
    validRir[0].low === validRir[0].high
      ? validRir[0].low
      : null;

  // Build the per-set rows so every set carries its own target.
  let perSet: PrescribedSetSpec[] | null = null;
  if (setCount !== null && setCount > 0 && (repsTokens.length > 0 || validRir.length > 0)) {
    perSet = [];
    for (let i = 0; i < setCount; i++) {
      const rep = repsTokens.length === 1 ? repsTokens[0] : repsTokens[i];
      const rir = rirTokens.length === 1 ? rirTokens[0] : rirTokens[i];
      perSet.push({
        setIndex: i + 1,
        repsLow: rep?.low ?? null,
        repsHigh: rep?.high ?? null,
        repsText: rep?.text ?? null,
        rirLow: rir && rir.error === null ? rir.low : null,
        rirHigh: rir && rir.error === null ? rir.high : null,
      });
    }
  }

  return { repsLow, repsHigh, repsText, rirLow, rirHigh, rirTarget, perSet };
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
