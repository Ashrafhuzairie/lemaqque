import type { LoggedSegment, Session, SetLog, SourceSet } from "./types";

export interface PreviousSet {
  sessionId: string;
  sessionName: string;
  completedAt: string;
  log: SetLog;
}
type SegmentShape = Pick<LoggedSegment, "label" | "unit" | "multiplier">;
const finiteBetween = (n: number, low: number, high: number) =>
  Number.isFinite(n) && n >= low && n <= high;
function sameShape(a: readonly SegmentShape[], b: readonly SegmentShape[]) {
  return (
    a.length > 0 &&
    a.length === b.length &&
    a.every((part, i) => {
      const other = b[i];
      return (
        typeof part.label === "string" &&
        typeof other?.label === "string" &&
        part.label.trim().toLowerCase() === other.label.trim().toLowerCase() &&
        part.unit === other.unit &&
        part.multiplier === other.multiplier
      );
    })
  );
}
function validParts(parts: readonly LoggedSegment[]) {
  return parts.every(
    (part) =>
      finiteBetween(part.reps, 0, 1000) &&
      finiteBetween(part.weight, 0, 1000) &&
      Number.isInteger(part.multiplier) &&
      part.multiplier > 0 &&
      (part.unit === "reps" || part.unit === "seconds") &&
      (part.unit !== "seconds" || part.weight === 0),
  );
}

/** Previous actual performance for this exact exercise/set, never a PDF example load. */
export function previousCompletedSet({
  current,
  sessions,
  logs,
  exerciseId,
  setNumber,
  sourceSet,
}: {
  current: Session;
  sessions: readonly Session[];
  logs: readonly SetLog[];
  exerciseId: string;
  setNumber: number;
  sourceSet?: SourceSet;
}): PreviousSet | undefined {
  const cutoff = Date.parse(current.started_at);
  if (
    !current.user_id ||
    !Number.isFinite(cutoff) ||
    !Number.isInteger(setNumber) ||
    setNumber < 1
  )
    return;
  const candidates = sessions
    .filter((session) => {
      const end = Date.parse(session.finished_at ?? "");
      const start = Date.parse(session.started_at);
      return (
        session.id !== current.id &&
        session.user_id === current.user_id &&
        session.status === "completed" &&
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start <= end &&
        end <= cutoff
      );
    })
    .sort(
      (a, b) =>
        Date.parse(b.finished_at!) - Date.parse(a.finished_at!) ||
        b.id.localeCompare(a.id),
    );
  for (const session of candidates) {
    const matches = logs.filter(
      (log) =>
        log.user_id === current.user_id &&
        log.session_id === session.id &&
        log.exercise_id === exerciseId &&
        log.set_number === setNumber &&
        log.completed,
    );
    // Duplicate legacy entries are ambiguous; don't pick an arbitrary load.
    if (matches.length !== 1) continue;
    const log = matches[0];
    if (!finiteBetween(log.rpe, 1, 10)) continue;
    if (sourceSet) {
      const oldRow = session.exercises?.find(
        (e) => e.exercise_id === exerciseId,
      )?.source?.rows[setNumber - 1];
      if (
        !oldRow ||
        oldRow.warmup !== sourceSet.warmup ||
        !sameShape(sourceSet.segments, oldRow.segments) ||
        !log.segments ||
        !sameShape(sourceSet.segments, log.segments) ||
        !validParts(log.segments)
      )
        continue;
    } else if (
      log.segments?.length ||
      !finiteBetween(log.reps, 0, 500) ||
      !finiteBetween(log.weight, 0, 1000)
    )
      continue;
    return {
      sessionId: session.id,
      sessionName: session.name,
      completedAt: session.finished_at!,
      log,
    };
  }
}

/** Copies only compatible repetition loads; current reps, holds and effort are untouched. */
export function reuseSegmentLoads(
  current: readonly LoggedSegment[],
  previous: readonly LoggedSegment[],
): LoggedSegment[] | undefined {
  if (!sameShape(current, previous) || !validParts(previous)) return;
  return current.map((part, i) => ({
    ...part,
    weight: part.unit === "reps" ? previous[i].weight : part.weight,
  }));
}

export function historyDate(stamp: string, timezone = "Asia/Singapore") {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date(stamp));
}
