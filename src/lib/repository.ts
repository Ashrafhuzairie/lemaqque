import { cloudDataError, CloudSetupError } from "./cloud-errors";
import { createClient } from "@supabase/supabase-js";
import { get, set } from "idb-keyval";
import type {
  TableName,
  Tables,
  ModelAsset,
  AnimationAsset,
  Session,
  SetLog,
  Attendance,
  Scheduled,
  Template,
} from "./types";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const LOCAL_USER = "00000000-0000-4000-8000-000000000001";
export const tableNames: TableName[] = [
  "profiles",
  "workout_templates",
  "workout_sessions",
  "set_logs",
  "attendance_records",
  "scheduled_workouts",
  "meal_entries",
  "water_entries",
  "nutrition_targets",
  "body_measurements",
];
let queue: Promise<unknown> = Promise.resolve();
export function repository(local: boolean, userId: string) {
  const storageKey = `lemaqque:v1:${userId}`;
  const client = () => {
    if (!supabase)
      throw Error(
        "Supabase is not configured. Use the device-local workspace or connect your project.",
      );
    return supabase;
  };
  const update = async (fn: (state: Record<string, unknown[]>) => void) => {
    const operation = queue
      .catch(() => {})
      .then(async () => {
        const state = (await get<Record<string, unknown[]>>(storageKey)) || {};
        fn(state);
        await set(storageKey, state);
      });
    queue = operation;
    await operation;
  };
  return {
    async list<K extends TableName>(table: K): Promise<Tables[K][]> {
      if (local) {
        await queue.catch(() => {});
        return (await get(storageKey))?.[table] || [];
      }
      const { data, error } = await client()
        .from(table)
        .select("*")
        .eq("user_id", userId);
      if (error) throw cloudDataError(error);
      return data as Tables[K][];
    },
    async save<K extends TableName>(table: K, value: Tables[K]) {
      if (value.user_id !== userId) throw Error("Owner mismatch.");
      if (local)
        await update((s) => {
          const rows = (s[table] || []) as { id: string }[];
          s[table] = [...rows.filter((r) => r.id !== value.id), value];
        });
      else {
        const { error } = await client().from(table).upsert(value);
        if (error) throw cloudDataError(error);
      }
      return value;
    },
    async importTemplates(templates: Template[]) {
      if (templates.some((t) => t.user_id !== userId))
        throw Error("Owner mismatch.");
      let added = 0;
      if (local)
        await update((state) => {
          const existing = (state.workout_templates || []) as Template[];
          const ids = new Set(existing.map((t) => t.id));
          const newRows = templates.filter((t) => !ids.has(t.id));
          added = newRows.length;
          state.workout_templates = [...existing, ...newRows];
        });
      else {
        const { data, error } = await client().rpc("import_source_templates", {
          templates,
        });
        if (error) {
          const failure = cloudDataError(error);
          if (failure instanceof CloudSetupError) throw failure;
          throw new Error(
            failure.message +
              " If this is a schema error, apply the program-prescription migration.",
          );
        }
        added = Number(data);
      }
      return added;
    },
    async remove(table: TableName, id: string) {
      if (local)
        await update((s) => {
          s[table] = ((s[table] || []) as { id: string }[]).filter(
            (r) => r.id !== id,
          );
          if (table === "workout_sessions")
            s.set_logs = (
              (s.set_logs || []) as { session_id: string }[]
            ).filter((l) => l.session_id !== id);
        });
      else {
        const { error } = await client()
          .from(table)
          .delete()
          .eq("id", id)
          .eq("user_id", userId);
        if (error) throw cloudDataError(error);
      }
    },
    async finishWorkout(sessionId: string, day: string) {
      if (local)
        await update((state) => {
          const sessions = (state.workout_sessions || []) as Session[];
          const session = sessions.find(
            (s) => s.id === sessionId && s.user_id === userId,
          );
          if (!session || session.status === "discarded")
            throw Error("Session unavailable.");
          if (
            !((state.set_logs || []) as SetLog[]).some(
              (l) => l.session_id === sessionId && l.completed,
            )
          )
            throw Error("Complete at least one set before finishing.");
          const stamp = new Date().toISOString();
          state.workout_sessions = sessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  status: "completed",
                  finished_at: s.finished_at || stamp,
                  paused_at: null,
                  paused_ms:
                    s.paused_ms +
                    (s.paused_at ? Date.now() - Date.parse(s.paused_at) : 0),
                }
              : s,
          );
          const records = (state.attendance_records || []) as Attendance[];
          const existing = records.find((a) => a.day === day);
          state.attendance_records = [
            ...records.filter((a) => a.day !== day),
            {
              id: existing?.id || crypto.randomUUID(),
              user_id: userId,
              day,
              status: "completed",
              notes: existing?.notes || "Workout completed.",
            },
          ];
          state.scheduled_workouts = (
            (state.scheduled_workouts || []) as Scheduled[]
          ).map((s) =>
            s.day === day && s.template_id === session.template_id
              ? { ...s, status: "completed" }
              : s,
          );
        });
      else {
        const { error } = await client().rpc("finish_workout", {
          session_id: sessionId,
          day,
        });
        if (error) throw cloudDataError(error);
      }
    },
    async exportData() {
      const entries = await Promise.all(
        tableNames.map(async (t) => [t, await this.list(t)]),
      );
      return Object.fromEntries(entries);
    },
    async clearLocal() {
      if (!local)
        throw Error("Cloud account deletion requires the server function.");
      await update((s) => {
        for (const t of tableNames) s[t] = [];
      });
    },
    async assets(): Promise<{
      models: ModelAsset[];
      animations: AnimationAsset[];
    }> {
      if (local || !supabase) return { models: [], animations: [] };
      const [models, animations] = await Promise.all([
        supabase
          .from("model_assets")
          .select("*")
          .eq("review_status", "approved"),
        supabase
          .from("exercise_animation_assets")
          .select("*")
          .eq("review_status", "approved"),
      ]);
      if (models.error || animations.error)
        throw Error("The reviewed 3D catalog could not be loaded.");
      return { models: models.data, animations: animations.data };
    },
  };
}
