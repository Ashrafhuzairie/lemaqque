import type { Attendance, Meal, Profile, SetLog, Template } from "./types";
import { exercises } from "./catalog";
export function localDay(
  date = new Date(),
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function nutritionTotals(meals: Meal[]) {
  return meals.reduce(
    (a, m) => ({
      calories: a.calories + m.calories * m.quantity,
      protein: a.protein + m.protein * m.quantity,
      carbs: a.carbs + m.carbs * m.quantity,
      fat: a.fat + m.fat * m.quantity,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
export const volume = (logs: SetLog[]) =>
  logs.filter((s) => s.completed).reduce((n, s) => n + s.reps * s.weight, 0);
export function attendanceRate(
  days: { day: string; status: string }[],
  attendance: Attendance[],
  today: string,
) {
  const planned = days.filter((d) => d.status !== "rest" && d.day <= today);
  if (!planned.length) return null;
  return Math.round(
    (planned.filter(
      (d) =>
        d.status === "completed" ||
        attendance.some((a) => a.day === d.day && a.status === "completed"),
    ).length /
      planned.length) *
      100,
  );
}
export function generateTemplates(
  profile: Pick<Profile, "days" | "equipment" | "experience" | "duration">,
  user_id: string,
): Template[] {
  const allowed = exercises.filter(
    (e) =>
      e.equipment === "Bodyweight" ||
      profile.equipment === "Gym" ||
      e.equipment === profile.equipment,
  );
  const chunks =
    profile.days.length >= 4
      ? [
          ["Chest", "Shoulders", "Triceps"],
          ["Back", "Biceps"],
          ["Quadriceps", "Hamstrings", "Glutes", "Calves"],
        ]
      : [["Quadriceps", "Chest", "Back", "Hamstrings", "Abdominals"]];
  return chunks.map((groups, i) => ({
    id: crypto.randomUUID(),
    user_id,
    name:
      chunks.length === 1
        ? "Full body · foundation"
        : ["Push · upper body", "Pull · upper body", "Legs · foundation"][i],
    split: chunks.length === 1 ? "Full Body" : "Push/Pull/Legs",
    exercises: groups
      .flatMap((g) => allowed.filter((e) => e.muscle === g).slice(0, 1))
      .slice(0, profile.duration < 35 ? 3 : 5)
      .map((e) => ({
        exercise_id: e.id,
        sets: profile.experience === "Beginner" ? 2 : 3,
        reps: e.reps,
        rest: e.rest,
      })),
  }));
}
export function progression(logs: SetLog[], targetReps: number) {
  const done = logs.filter((l) => l.completed);
  return done.length >= 3 &&
    done.every((l) => l.reps >= targetReps && l.rpe <= 7)
    ? "All logged sets reached the target at RPE 7 or below. If you feel recovered, consider the smallest available weight increase next session. Keep the current weight if technique changes."
    : "Keep the load comfortable and aim for consistent, controlled repetitions before adding weight.";
}
export function elapsed(
  session: {
    started_at: string;
    finished_at: string | null;
    paused_at: string | null;
    paused_ms: number;
  },
  now = Date.now(),
) {
  return Math.max(
    0,
    Math.floor(
      ((session.finished_at
        ? Date.parse(session.finished_at)
        : session.paused_at
          ? Date.parse(session.paused_at)
          : now) -
        Date.parse(session.started_at) -
        session.paused_ms) /
        1000,
    ),
  );
}
export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}
