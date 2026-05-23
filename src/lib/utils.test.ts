import { describe, it, expect } from "vitest";
import { weekStartFor, todayInAppTz } from "./utils";

describe("weekStartFor", () => {
  it("returns the Monday of the containing week", () => {
    expect(weekStartFor("2026-05-20")).toBe("2026-05-18"); // Wed -> Mon
    expect(weekStartFor("2026-05-18")).toBe("2026-05-18"); // Mon -> Mon
    expect(weekStartFor("2026-05-24")).toBe("2026-05-18"); // Sun -> prior Mon
  });
});

describe("todayInAppTz", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayInAppTz()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
