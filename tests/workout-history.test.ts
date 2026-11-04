import { describe, expect, it } from "vitest";
import {
  previousCompletedSet,
  reuseSegmentLoads,
  historyDate,
} from "../src/lib/workout-history";
import { cloudDataError, CloudSetupError } from "../src/lib/cloud-errors";
import { allSourceWorkouts, workoutPrescription } from "../src/lib/programs";
import type { Session, SetLog, LoggedSegment } from "../src/lib/types";
const current: Session = {
  id: "current",
  user_id: "owner",
  template_id: null,
  name: "Today",
  exercises: [],
  started_at: "2026-11-04T04:00:00Z",
  finished_at: null,
  paused_at: null,
  paused_ms: 0,
  status: "active",
};
const past = (id = "past", extra: Partial<Session> = {}): Session => ({
  ...current,
  id,
  name: "Previous workout",
  started_at: "2026-11-02T04:00:00Z",
  finished_at: "2026-11-02T05:00:00Z",
  status: "completed",
  ...extra,
});
const log = (session_id = "past", extra: Partial<SetLog> = {}): SetLog => ({
  id: "log-" + session_id,
  user_id: "owner",
  session_id,
  exercise_id: "bench",
  set_number: 1,
  reps: 12,
  weight: 55,
  rpe: 8,
  completed: true,
  ...extra,
});
const query = (sessions: Session[], logs: SetLog[], extra = {}) =>
  previousCompletedSet({
    current,
    sessions,
    logs,
    exerciseId: "bench",
    setNumber: 1,
    ...extra,
  });
const sourceWorkout = allSourceWorkouts.find(
  (w) => w.workout.id === "bulk-chest",
)!;
const sourcePlan = workoutPrescription(
  sourceWorkout.program,
  sourceWorkout.phase,
  sourceWorkout.workout,
);
const sourceExercise = sourcePlan[2];
const sourceRow = sourceExercise.source!.rows[0];
const parts = (): LoggedSegment[] =>
  sourceRow.segments.map((p, i) => ({
    label: p.label,
    reps: 3 + i,
    weight: 10 + i,
    unit: p.unit,
    multiplier: p.multiplier,
  }));
const sourceLog = (extra: Partial<SetLog> = {}): SetLog =>
  log("past", {
    exercise_id: sourceExercise.exercise_id,
    segments: parts(),
    ...extra,
  });
const sourceQuery = (session: Session, logged: SetLog, extra = {}) =>
  previousCompletedSet({
    current: { ...current, exercises: sourcePlan },
    sessions: [session],
    logs: [logged],
    exerciseId: sourceExercise.exercise_id,
    setNumber: 1,
    sourceSet: sourceRow,
    ...extra,
  });

describe("previous completed performance", () => {
  it("selects the newest completed matching set regardless of input order", () => {
    const newer = past("newer", {
      started_at: "2026-11-03T04:00:00Z",
      finished_at: "2026-11-03T05:00:00Z",
    });
    expect(
      query([newer, past()], [log("newer", { weight: 60 }), log()])?.log.weight,
    ).toBe(60);
    expect(
      query([past(), newer], [log(), log("newer", { weight: 60 })])?.sessionId,
    ).toBe("newer");
  });
  it("does not treat another exercise or another set number as the previous set", () => {
    expect(
      query(
        [past()],
        [log("past", { set_number: 2 }), log("past", { exercise_id: "curl" })],
      ),
    ).toBeUndefined();
  });
  it("excludes active, discarded, unfinished and future sessions", () => {
    for (const invalid of [
      { status: "active", finished_at: null },
      { status: "discarded" },
      { finished_at: null },
      { finished_at: "2026-11-05T00:00:00Z" },
      { started_at: "bad date" },
    ] as Partial<Session>[])
      expect(query([past("past", invalid)], [log()])).toBeUndefined();
    expect(query([current], [log("current")])).toBeUndefined();
  });
  it("ignores incomplete logs and records owned by another account", () => {
    expect(
      query([past()], [log("past", { completed: false })]),
    ).toBeUndefined();
    expect(
      query([past("past", { user_id: "other" })], [log()]),
    ).toBeUndefined();
    expect(
      query([past()], [log("past", { user_id: "other" })]),
    ).toBeUndefined();
  });
  it("rejects ambiguous duplicate sets and invalid recorded numbers", () => {
    expect(
      query([past()], [log(), log("past", { id: "duplicate", weight: 90 })]),
    ).toBeUndefined();
    for (const change of [
      { weight: NaN },
      { weight: 1001 },
      { reps: -1 },
      { rpe: 11 },
    ])
      expect(query([past()], [log("past", change)])).toBeUndefined();
  });
  it("does not show composite-set history in a generic single-load set", () => {
    expect(
      query([past()], [log("past", { segments: parts() })]),
    ).toBeUndefined();
  });
  it("matches all parts of a source ladder to its saved prescription", () => {
    const previous = sourceQuery(
      past("past", { exercises: sourcePlan }),
      sourceLog(),
    );
    expect(previous?.log.segments).toHaveLength(9);
    expect(previous?.log.segments?.[0].weight).toBe(10);
  });
  it("rejects missing, reordered or incompatible source components and warm-up changes", () => {
    const saved = past("past", { exercises: sourcePlan });
    expect(
      sourceQuery(saved, sourceLog({ segments: parts().slice(1) })),
    ).toBeUndefined();
    const changed = parts();
    changed[0] = { ...changed[0], unit: "seconds", weight: 0 };
    expect(
      sourceQuery(saved, sourceLog({ segments: changed })),
    ).toBeUndefined();
    changed[0] = { ...parts()[0], multiplier: 2 };
    expect(
      sourceQuery(saved, sourceLog({ segments: changed })),
    ).toBeUndefined();
    expect(sourceQuery(past(), sourceLog())).toBeUndefined();
    const changedPlan = structuredClone(sourcePlan);
    changedPlan[2].source!.rows[0].warmup = !sourceRow.warmup;
    expect(
      sourceQuery(past("past", { exercises: changedPlan }), sourceLog()),
    ).toBeUndefined();
  });
  it("leaves input arrays and logs unchanged", () => {
    const sessions = [past()],
      logs = [log()];
    const before = structuredClone({ sessions, logs });
    query(sessions, logs);
    expect({ sessions, logs }).toEqual(before);
  });
});

describe("explicit load reuse", () => {
  it("copies component loads only, preserving current reps, units, side multipliers and labels", () => {
    const actual = parts(),
      now = parts().map((p) => ({ ...p, reps: 15, weight: 0 }));
    const copied = reuseSegmentLoads(now, actual)!;
    expect(copied.map((p) => p.weight)).toEqual(actual.map((p) => p.weight));
    expect(copied.every((p) => p.reps === 15)).toBe(true);
    expect(now.every((p) => p.weight === 0)).toBe(true);
    expect(copied[0].label).toBe(now[0].label);
    expect(copied[0].multiplier).toBe(now[0].multiplier);
  });
  it("does not copy timed holds or reuse a different movement shape", () => {
    const now: LoggedSegment[] = [
      { label: "Fly", unit: "reps", multiplier: 1, reps: 12, weight: 0 },
      { label: "Flex", unit: "seconds", multiplier: 1, reps: 20, weight: 0 },
    ];
    const previous = [
      { ...now[0], reps: 8, weight: 25 },
      { ...now[1], reps: 10 },
    ];
    expect(reuseSegmentLoads(now, previous)).toEqual([
      { ...now[0], weight: 25 },
      now[1],
    ]);
    expect(reuseSegmentLoads(now, [previous[1], previous[0]])).toBeUndefined();
  });
  it("formats historical dates in the profile timezone", () => {
    expect(historyDate("2026-11-03T20:00:00Z", "Asia/Singapore")).toBe(
      "4 Nov 2026",
    );
    expect(historyDate("2026-11-03T20:00:00Z", "UTC")).toBe("3 Nov 2026");
  });
});

describe("cloud setup errors", () => {
  it("explains unavailable tables and RPCs without showing raw schema-cache errors", () => {
    for (const code of ["PGRST205", "PGRST202"]) {
      const error = cloudDataError({ code, message: "Raw schema cache error" });
      expect(error).toBeInstanceOf(CloudSetupError);
      expect(error.message).toContain("Cloud storage setup is incomplete");
      expect(error.message).not.toContain("Raw schema");
    }
  });
  it("does not misclassify connection, permission or validation errors", () => {
    for (const error of [
      { code: "42501", message: "Permission denied" },
      { message: "Failed to fetch" },
      { code: "23514", message: "Validation failed" },
    ])
      expect(cloudDataError(error).message).toBe(error.message);
  });
});
