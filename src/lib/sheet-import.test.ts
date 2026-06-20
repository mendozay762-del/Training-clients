import { describe, it, expect } from "vitest";
import { parseSheetPaste } from "./sheet-import";

describe("parseSheetPaste", () => {
  it("accepts case-insensitive / spaced headers (tab-separated) and parses a row", () => {
    const input = [
      "Prescribed_for\tWorkout Name\texercise_name\tSets\tReps\tLoad\tRIR\tNotes",
      "2026-05-20\tUpper A\tBench Press\t3\t6-10\t185\t2\tTop set",
    ].join("\n");

    const r = parseSheetPaste(input);
    expect(r.errors).toHaveLength(0);
    expect(r.rows).toHaveLength(1);

    const row = r.rows[0];
    expect(row.prescribedFor).toBe("2026-05-20");
    expect(row.workoutName).toBe("Upper A");
    expect(row.exerciseName).toBe("Bench Press");
    expect(row.sets).toBe(3);
    expect(row.repsLow).toBe(6);
    expect(row.repsHigh).toBe(10);
    expect(row.loadLbs).toBe(185);
    expect(row.rirTarget).toBe(2);
    expect(row.notes).toBe("Top set");
  });

  it("parses comma-separated rows with %1RM, bodyweight, and AMRAP", () => {
    const input = [
      "prescribed_for,exercise_name,reps,load",
      "2026-05-20,Squat,5,75%",
      "2026-05-20,Pushup,AMRAP,BW",
    ].join("\n");

    const r = parseSheetPaste(input);
    expect(r.errors).toHaveLength(0);
    expect(r.rows).toHaveLength(2);
    expect(r.rows[0].repsLow).toBe(5);
    expect(r.rows[0].loadPct1rm).toBe(75);
    expect(r.rows[1].repsText).toBe("AMRAP");
    expect(r.rows[1].loadText).toBe("BW");
  });

  it("flags a bad date and a missing required header", () => {
    const badDate = parseSheetPaste(
      "prescribed_for,exercise_name\nnotadate,Squat",
    );
    expect(badDate.rows).toHaveLength(0);
    expect(badDate.errors.some((e) => e.column === "prescribed_for")).toBe(true);

    const noHeader = parseSheetPaste("foo,bar\n1,2");
    expect(noHeader.errors.some((e) => e.column === "header")).toBe(true);
  });

  it("keeps a single plain RIR as the legacy target and broadcasts it to every set", () => {
    const r = parseSheetPaste(
      ["prescribed_for,exercise_name,sets,reps,rir", "2026-05-20,Bench Press,3,6-10,2"].join("\n"),
    );
    expect(r.errors).toHaveLength(0);
    const row = r.rows[0];
    expect(row.rirTarget).toBe(2);
    expect(row.rirLow).toBe(2);
    expect(row.rirHigh).toBe(2);
    expect(row.perSet).toHaveLength(3);
    expect(row.perSet?.every((s) => s.rirLow === 2 && s.rirHigh === 2)).toBe(true);
    expect(row.perSet?.[0]).toMatchObject({ repsLow: 6, repsHigh: 10 });
  });

  it("parses per-set RIR ranges separated by | (sets 1-2 at 1-2, last at 0-1)", () => {
    const r = parseSheetPaste(
      [
        "prescribed_for,exercise_name,sets,reps,rir",
        "2026-05-20,Hack Squat,3,8-10,1-2 | 1-2 | 0-1",
      ].join("\n"),
    );
    expect(r.errors).toHaveLength(0);
    const row = r.rows[0];
    expect(row.sets).toBe(3);
    // No single legacy target when a range / per-set is used.
    expect(row.rirTarget).toBeNull();
    // Exercise-level summary is the envelope across the sets.
    expect(row.rirLow).toBe(0);
    expect(row.rirHigh).toBe(2);
    expect(row.perSet).toHaveLength(3);
    expect(row.perSet?.[0]).toMatchObject({ setIndex: 1, rirLow: 1, rirHigh: 2 });
    expect(row.perSet?.[1]).toMatchObject({ setIndex: 2, rirLow: 1, rirHigh: 2 });
    expect(row.perSet?.[2]).toMatchObject({ setIndex: 3, rirLow: 0, rirHigh: 1 });
    // Single reps range broadcasts to all sets.
    expect(row.perSet?.every((s) => s.repsLow === 8 && s.repsHigh === 10)).toBe(true);
  });

  it("flags a per-set count that doesn't match the number of sets", () => {
    const r = parseSheetPaste(
      ["prescribed_for,exercise_name,sets,reps,rir", "2026-05-20,Squat,3,5,1-2 | 0-1"].join("\n"),
    );
    expect(r.errors.some((e) => e.column === "rir")).toBe(true);
  });

  it("supports a single RIR range applied to all sets", () => {
    const r = parseSheetPaste(
      ["prescribed_for,exercise_name,sets,reps,rir", "2026-05-20,RDL,3,8,0-1"].join("\n"),
    );
    expect(r.errors).toHaveLength(0);
    const row = r.rows[0];
    expect(row.rirTarget).toBeNull();
    expect(row.rirLow).toBe(0);
    expect(row.rirHigh).toBe(1);
    expect(row.perSet).toHaveLength(3);
    expect(row.perSet?.every((s) => s.rirLow === 0 && s.rirHigh === 1)).toBe(true);
  });
});
