import manifest from "../data/exercise-media.json";
import { sourceExercises } from "./programs";
import type { SourcePrescription } from "./types";

export interface ExerciseImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
}
export interface ExerciseReference {
  title: string;
  images: ExerciseImage[];
  photoNote?: string;
  source?: { name: string; url: string; license: string; revision: string };
  drawing?: ExerciseImage & { page: number; source: string };
}
export interface ExercisePictureEntry {
  reference: string;
  label?: string;
  note?: string;
}
export const exerciseMedia = manifest as {
  references: Record<string, ExerciseReference>;
  exercises: Record<string, ExercisePictureEntry[]>;
  missing: Record<string, string>;
};
export function sourcePictureId(source: SourcePrescription) {
  return sourceExercises.find(
    (e) =>
      e.prescription?.workoutId === source.workoutId && e.name === source.name,
  )?.id;
}
export function exerciseThumbnail(id: string) {
  const entry = exerciseMedia.exercises[id]?.[0];
  const ref = entry && exerciseMedia.references[entry.reference];
  return ref?.images[0];
}
