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
});
