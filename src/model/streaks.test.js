// ABOUTME: Vitest tests for the streak calculation pure functions.
// ABOUTME: Covers getIntervalMap, getTimeProperties, and runStreaks edge cases.

import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  getIntervalMap,
  getTimeProperties,
  runStreaks,
} from "./streaks";

//////////////////////////////////////////////////////
// getIntervalMap
//////////////////////////////////////////////////////

describe("getIntervalMap", () => {
  it("returns a single-element array when a and b are in the same interval", () => {
    const a = 0;
    const b = 500;
    const interval = 1000;
    expect(getIntervalMap(a, b, interval)).toEqual([0]);
  });

  it("returns correct intervals between two values", () => {
    const a = 0;
    const b = 3000;
    const interval = 1000;
    expect(getIntervalMap(a, b, interval)).toEqual([0, 1000, 2000, 3000]);
  });

  it("works when valueA is larger than valueB", () => {
    const a = 3000;
    const b = 0;
    const interval = 1000;
    expect(getIntervalMap(a, b, interval)).toEqual([0, 1000, 2000, 3000]);
  });

  it("includes the end value when it aligns exactly on an interval", () => {
    const result = getIntervalMap(0, 2000, 1000);
    expect(result[result.length - 1]).toBe(2000);
  });
});

//////////////////////////////////////////////////////
// getTimeProperties
//////////////////////////////////////////////////////

describe("getTimeProperties", () => {
  it("returns startOfDayLocal at midnight for a mid-day timestamp", () => {
    const ts = "2024-06-15T14:30:00";
    const { startOfDayLocal } = getTimeProperties(ts);
    const date = new Date(startOfDayLocal);
    expect(date.getHours()).toBe(0);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
    expect(date.getDate()).toBe(15);
    expect(date.getMonth()).toBe(5); // 0-indexed
  });

  it("returns startOfTomorrowLocal exactly one day after startOfDayLocal", () => {
    const ts = "2024-06-15T14:30:00";
    const { startOfDayLocal, startOfTomorrowLocal } = getTimeProperties(ts);
    expect(startOfTomorrowLocal - startOfDayLocal).toBe(DAY_MS);
  });

  it("handles timestamps at midnight itself", () => {
    const ts = "2024-06-15T00:00:00";
    const { startOfDayLocal } = getTimeProperties(ts);
    const date = new Date(startOfDayLocal);
    expect(date.getDate()).toBe(15);
    expect(date.getHours()).toBe(0);
  });
});

//////////////////////////////////////////////////////
// runStreaks
//////////////////////////////////////////////////////

describe("runStreaks", () => {
  const today = new Date();

  const isoForDaysAgo = (daysAgo, hour = 12) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };

  it("returns zeros for an empty timestamps array", () => {
    const result = runStreaks([]);
    expect(result.currentStreak).toBe(0);
    expect(result.largestStreak).toBe(0);
    expect(result.totalCompletions).toBe(0);
    expect(result.totalIntervals).toBe(0);
  });

  it("returns currentStreak of 1 for a single timestamp today", () => {
    const result = runStreaks([isoForDaysAgo(0)]);
    expect(result.currentStreak).toBe(1);
    expect(result.totalCompletions).toBe(1);
  });

  it("returns correct currentStreak for consecutive days", () => {
    const timestamps = [isoForDaysAgo(0), isoForDaysAgo(1), isoForDaysAgo(2)];
    const result = runStreaks(timestamps);
    expect(result.currentStreak).toBe(3);
    expect(result.totalCompletions).toBe(3);
  });

  it("currentStreak reflects only the tail run after a gap", () => {
    const timestamps = [
      isoForDaysAgo(0),
      isoForDaysAgo(1),
      // gap on day 2
      isoForDaysAgo(3),
      isoForDaysAgo(4),
      isoForDaysAgo(5),
    ];
    const result = runStreaks(timestamps);
    expect(result.currentStreak).toBe(2);
    expect(result.largestStreak).toBe(3);
  });

  it("largestStreak tracks the longest run correctly", () => {
    const timestamps = [
      isoForDaysAgo(0),
      // gap
      isoForDaysAgo(2),
      isoForDaysAgo(3),
      isoForDaysAgo(4),
      isoForDaysAgo(5),
    ];
    const result = runStreaks(timestamps);
    expect(result.largestStreak).toBe(4);
    expect(result.currentStreak).toBe(1);
  });

  it("counts totalCompletions and totalIntervals correctly", () => {
    const timestamps = [isoForDaysAgo(0), isoForDaysAgo(1), isoForDaysAgo(3)];
    const result = runStreaks(timestamps);
    expect(result.totalCompletions).toBe(3);
    expect(result.totalIntervals).toBeGreaterThan(0);
  });

  it("multiple timestamps on the same day count as one completion", () => {
    const timestamps = [
      isoForDaysAgo(0, 9),
      isoForDaysAgo(0, 14),
      isoForDaysAgo(0, 20),
    ];
    const result = runStreaks(timestamps);
    expect(result.currentStreak).toBe(1);
    expect(result.totalCompletions).toBe(1);
  });
});
