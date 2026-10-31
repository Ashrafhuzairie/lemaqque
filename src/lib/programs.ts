import sourceData from "../data/buendia-programs.json";
import type {
  Exercise,
  Prescription,
  Template,
  SourcePrescription,
  SourceSet,
  SourceSegment,
} from "./types";
export interface ProgramExercise {
  id: string;
  name: string;
  muscle: string;
  page: number;
  restMin: number | null;
  restMax: number | null;
  sets: SourceSet[];
  notes: string[];
}
export interface ProgramWorkout {
  id: string;
  name: string;
  pages: number[];
  notes: string[];
  exercises: ProgramExercise[];
}
export interface ProgramPhase {
  id: string;
  title: string;
  weeks: [number, number] | null;
  workouts: ProgramWorkout[];
}
export interface SourceSection {
  title: string;
  pages: number[];
  lines: string[];
}
export interface SourceMeal {
  name: string;
  page: number;
  items: string[];
  notes?: string;
}
export interface SourceMacros {
  protein: number;
  carbs: number;
  fat: number;
}
export interface SourceDay extends SourceMacros {
  day: number;
  weightLb: number;
  mode: string;
}
export interface ProgramDefinition {
  id: string;
  title: string;
  author: string;
  fileName: string;
  sourceSha256: string;
  duration: string;
  description: string;
  schedule: string[];
  notes: string[];
  phases: ProgramPhase[];
  nutrition: {
    sections: SourceSection[];
    meals: SourceMeal[];
    examples: (SourceMacros & { weightLb: number })[];
    formula?: {
      page: number;
      proteinPerLb: number;
      carbsPerLb: number;
      fatPerLb: number;
      proteinKcal: number;
      carbsKcal: number;
      fatKcal: number;
      adjustmentMin: number;
      adjustmentMax: number;
      refeedCarbMultiplier: number;
    };
    monthlyExample?: {
      page: number[];
      startingWeightLb: number;
      baseline: SourceMacros;
      days: SourceDay[];
    };
  };
  cardio: SourceSection[];
}
export const programDefinitions = sourceData as unknown as ProgramDefinition[];
export const allSourceWorkouts = programDefinitions.flatMap((program) =>
  program.phases.flatMap((phase) =>
    phase.workouts.map((workout) => ({ program, phase, workout })),
  ),
);
export function sourcePrescription(
  program: ProgramDefinition,
  phase: ProgramPhase,
  workout: ProgramWorkout,
  exercise: ProgramExercise,
): SourcePrescription {
  return {
    programId: program.id,
    programTitle: program.title,
    phaseId: phase.id,
    phaseTitle: phase.title,
    workoutId: workout.id,
    fileName: program.fileName,
    page: exercise.page,
    name: exercise.name,
    restMin: exercise.restMin,
    restMax: exercise.restMax,
    rows: exercise.sets,
    notes: exercise.notes,
    workoutNotes: workout.notes,
  };
}
export const sourceExercises: Exercise[] = allSourceWorkouts.flatMap(
  ({ program, phase, workout }) =>
    workout.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      muscle: exercise.muscle,
      secondary: [],
      equipment: "Gym",
      difficulty: "Advanced",
      sets: exercise.sets.length,
      reps: 1,
      rest: exercise.restMin ?? 0,
      instructions: exercise.notes,
      mistakes:
        "Follow the source prescription and use a personally suitable load. No technique animation has been validated for this source block.",
      alternative: "Not specified by this source block",
      prescription: sourcePrescription(program, phase, workout, exercise),
    })),
);
export function workoutPrescription(
  program: ProgramDefinition,
  phase: ProgramPhase,
  workout: ProgramWorkout,
): Prescription[] {
  return workout.exercises.map((e) => ({
    exercise_id: e.id,
    sets: e.sets.length,
    reps: 1,
    rest: e.restMin ?? 0,
    source: sourcePrescription(program, phase, workout, e),
  }));
}
export function restLabel(
  source: Pick<SourcePrescription, "restMin" | "restMax">,
) {
  return source.restMin === null
    ? "Rest not specified"
    : source.restMin === source.restMax
      ? `${source.restMin}s rest`
      : `${source.restMin}–${source.restMax}s rest`;
}
export async function sourceTemplateId(userId: string, workoutId: string) {
  const hash = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${userId}:${workoutId}`),
    ),
  ).slice(0, 16);
  hash[6] = (hash[6] & 15) | 64;
  hash[8] = (hash[8] & 63) | 128;
  const hex = Array.from(hash, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
export async function createSourceTemplates(
  userId: string,
  selected: typeof allSourceWorkouts,
): Promise<Template[]> {
  return Promise.all(
    selected.map(async ({ program, phase, workout }) => ({
      id: await sourceTemplateId(userId, workout.id),
      user_id: userId,
      name: `${program.id === "legendary-chest" ? "Legendary Chest" : program.id === "shred" ? "Shred" : "Bulk"} · ${workout.name}`,
      split: workout.name.startsWith("Abs")
        ? "Abdominals"
        : program.id === "legendary-chest"
          ? "Chest specialization"
          : "Body-part split",
      exercises: workoutPrescription(program, phase, workout),
    })),
  );
}
export const KG_TO_LB = 2.2046226218487757;
export function sourceMacroCalories(macros: SourceMacros) {
  return macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
}
export function calculateShredMacros(
  weight: number,
  unit: "kg" | "lb",
  mode: "base" | "adjusted" | "refeed",
  carbReduction = 25,
) {
  if (!Number.isFinite(weight) || weight <= 0)
    throw Error("Enter a positive body weight.");
  if (
    !Number.isFinite(carbReduction) ||
    carbReduction < 25 ||
    carbReduction > 50
  )
    throw Error("The source specifies a 25–50 g carbohydrate reduction.");
  const lbs = unit === "kg" ? weight * KG_TO_LB : weight;
  const formula = programDefinitions.find((p) => p.id === "shred")!.nutrition
    .formula!;
  const protein = lbs * formula.proteinPerLb;
  const baseCarbs = lbs * formula.carbsPerLb;
  const adjusted = baseCarbs - carbReduction;
  if (mode !== "base" && adjusted < 0)
    throw Error(
      "The selected reduction exceeds the calculated carbohydrate amount.",
    );
  const carbs =
    mode === "base"
      ? baseCarbs
      : mode === "adjusted"
        ? adjusted
        : adjusted * formula.refeedCarbMultiplier;
  const fat = lbs * formula.fatPerLb;
  return {
    weightLb: lbs,
    protein,
    carbs,
    fat,
    calories: sourceMacroCalories({ protein, carbs, fat }),
  };
}
export function defaultSegmentLog(segment: SourceSegment) {
  return {
    label: segment.label,
    reps: segment.reps ?? 0,
    weight: 0,
    unit: segment.unit,
    multiplier: segment.multiplier,
  };
}
