import { z } from "zod";
const number = (min: number, max: number) =>
  z.coerce.number().finite().min(min).max(max);
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  age: number(18, 100),
  height: number(100, 250),
  weight: number(30, 400),
  target_weight: number(30, 400),
  goal: z.enum([
    "Muscle building",
    "Fat loss",
    "Body recomposition",
    "Strength",
    "General fitness",
    "Maintenance",
  ]),
  experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
  days: z
    .array(z.number().int().min(0).max(6))
    .min(1)
    .max(7)
    .refine((a) => new Set(a).size === a.length),
  duration: number(15, 180),
  equipment: z.enum(["Gym", "Dumbbells", "Bodyweight"]),
  restrictions: z.string().max(1000),
  timezone: z.string().refine((v) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: v });
      return true;
    } catch {
      return false;
    }
  }),
  quality: z.enum(["auto", "static"]),
});
export const mealSchema = z.object({
  name: z.string().trim().min(1).max(120),
  meal: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  quantity: number(0.01, 100),
  unit: z.string().trim().min(1).max(50),
  calories: number(0, 5000),
  protein: number(0, 500),
  carbs: number(0, 1000),
  fat: number(0, 500),
  source: z.string().trim().min(3).max(500),
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
export const setSchema = z.object({
  reps: number(0, 500).int(),
  weight: number(0, 1000),
  rpe: number(1, 10),
});
export const targetSchema = z.object({
  calories: number(1200, 6000),
  protein: number(20, 400),
  carbs: number(20, 1000),
  fat: number(20, 300),
  water_ml: number(500, 6000),
});
export const templateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  split: z.string().min(1),
  exercises: z
    .array(
      z.object({
        exercise_id: z.string().min(1),
        sets: number(1, 10).int(),
        reps: number(1, 100).int(),
        rest: number(15, 600).int(),
      }),
    )
    .min(1)
    .max(20),
});
