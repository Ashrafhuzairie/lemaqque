export type Goal =
  | "Muscle building"
  | "Fat loss"
  | "Body recomposition"
  | "Strength"
  | "General fitness"
  | "Maintenance";
export interface Profile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  target_weight: number;
  goal: Goal;
  experience: "Beginner" | "Intermediate" | "Advanced";
  days: number[];
  duration: number;
  equipment: "Gym" | "Dumbbells" | "Bodyweight";
  restrictions: string;
  timezone: string;
  quality: "auto" | "static";
}
export interface Prescription {
  exercise_id: string;
  sets: number;
  reps: number;
  rest: number;
}
export interface Template {
  id: string;
  user_id: string;
  name: string;
  split: string;
  exercises: Prescription[];
}
export interface Session {
  id: string;
  user_id: string;
  template_id: string | null;
  name: string;
  exercises: Prescription[];
  started_at: string;
  finished_at: string | null;
  paused_at: string | null;
  paused_ms: number;
  status: "active" | "completed" | "discarded";
}
export interface SetLog {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  rpe: number;
  completed: boolean;
}
export interface Attendance {
  id: string;
  user_id: string;
  day: string;
  status: "completed" | "partial" | "rest";
  notes: string;
}
export interface Scheduled {
  id: string;
  user_id: string;
  template_id: string | null;
  day: string;
  status: "planned" | "completed" | "partial" | "rest" | "missed";
  notes: string;
}
export interface Meal {
  id: string;
  user_id: string;
  day: string;
  name: string;
  meal: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: string;
}
export interface Water {
  id: string;
  user_id: string;
  day: string;
  ml: number;
}
export interface Targets {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
}
export interface Measurement {
  id: string;
  user_id: string;
  day: string;
  weight: number;
  waist: number | null;
  chest: number | null;
  hips: number | null;
}
export interface ModelAsset {
  id: string;
  url: string;
  source_url: string;
  license: string;
  attribution: string;
  review_status: string;
  region_map: Record<string, string[]>;
}
export interface AnimationAsset {
  id: string;
  exercise_id: string;
  model_id: string;
  clip_name: string;
  review_status: string;
  reviewed_by: string;
  reviewed_at: string;
}
export interface Tables {
  profiles: Profile;
  workout_templates: Template;
  workout_sessions: Session;
  set_logs: SetLog;
  attendance_records: Attendance;
  scheduled_workouts: Scheduled;
  meal_entries: Meal;
  water_entries: Water;
  nutrition_targets: Targets;
  body_measurements: Measurement;
}
export type TableName = keyof Tables;
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  secondary: string[];
  equipment: string;
  difficulty: string;
  sets: number;
  reps: number;
  rest: number;
  instructions: string[];
  mistakes: string;
  alternative: string;
}
