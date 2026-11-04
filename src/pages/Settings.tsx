import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Save, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useProfile, useStore, useSave, useRows, identity } from "../lib/store";
import { profileSchema } from "../lib/validation";
import { generateTemplates, localDay } from "../lib/fitness";
import type { Profile } from "../lib/types";
import { Button } from "../components/ui/button";
import {
  PageHead,
  Field,
  Notice,
  Pending,
  weekdays,
} from "../components/common";
import { supabase } from "../lib/repository";
export default function Settings() {
  const profileQuery = useProfile();
  if (profileQuery.isPending) return <Pending />;
  if (profileQuery.error)
    return <Notice error>{profileQuery.error.message}</Notice>;
  return <ProfileForm current={profileQuery.profile} />;
}
function ProfileForm({ current }: { current?: Profile }) {
  const { userId, repo, local, signOut } = useStore();
  const save = useSave("profiles");
  const templates = useRows("workout_templates");
  const query = useQueryClient();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const form = useForm<
    z.input<typeof profileSchema>,
    unknown,
    z.output<typeof profileSchema>
  >({
    resolver: zodResolver(profileSchema),
    defaultValues: current || {
      name: "",
      age: 25,
      height: 170,
      weight: 70,
      target_weight: 70,
      goal: "General fitness",
      experience: "Beginner",
      days: [1, 3, 5],
      duration: 45,
      equipment: "Gym",
      restrictions: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      quality: "auto",
    },
  });
  const days = form.watch("days") as number[];
  async function submit(values: unknown) {
    setError("");
    setMessage("");
    try {
      const parsed = profileSchema.parse(values);
      await save.mutateAsync({
        ...parsed,
        id: current?.id || userId!,
        user_id: userId!,
      });
      setMessage(
        "Your preferences are saved. Historical records are unchanged.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function generate() {
    setBusy(true);
    setError("");
    try {
      const parsed = profileSchema.parse(form.getValues());
      await save.mutateAsync({
        ...parsed,
        id: current?.id || userId!,
        user_id: userId!,
      });
      const rows = generateTemplates(parsed, userId!);
      for (const row of rows) await repo.save("workout_templates", row);
      const today = localDay(new Date(), parsed.timezone);
      const start = new Date(today + "T12:00:00Z");
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + i);
        if (parsed.days.includes(date.getUTCDay()))
          await repo.save("scheduled_workouts", {
            ...identity(userId!),
            template_id: rows[i % rows.length].id,
            day: date.toISOString().slice(0, 10),
            status: "planned",
            notes: "Generated from your preferences.",
          });
      }
      query.invalidateQueries();
      navigate("/app/workouts");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function exportData() {
    setError("");
    try {
      const data = await repo.exportData();
      const url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              {
                version: 1,
                exported_at: new Date().toISOString(),
                mode: local ? "local" : "cloud",
                data,
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `lemaqque-${localDay()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function deleteAccount() {
    setBusy(true);
    setError("");
    try {
      if (local) await repo.clearLocal();
      else {
        if (!supabase) throw Error("Supabase unavailable.");
        const { error } = await supabase.functions.invoke("delete-account", {
          body: { confirmation: "DELETE" },
        });
        if (error) throw error;
      }
      await signOut();
      navigate("/auth", { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHead
        title={current ? "Your preferences." : "Make it your own."}
        description="A plan should fit your life. Start with the essentials, then adjust as you go."
      />
      <form
        className="panel settings-form"
        onSubmit={form.handleSubmit(submit)}
      >
        <h2>Training profile</h2>
        <div className="form-grid">
          <Field label="Your name">
            <input
              {...form.register("name")}
              placeholder="What should we call you?"
            />
          </Field>
          <Field label="Main objective">
            <select {...form.register("goal")}>
              {[
                "Muscle building",
                "Fat loss",
                "Body recomposition",
                "Strength",
                "General fitness",
                "Maintenance",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Age (18+)"
            hint="This initial workspace is designed for adults."
          >
            <input type="number" {...form.register("age")} />
          </Field>
          <Field label="Height · cm">
            <input type="number" {...form.register("height")} />
          </Field>
          <Field label="Current weight · kg">
            <input type="number" step="0.1" {...form.register("weight")} />
          </Field>
          <Field label="Target weight · kg">
            <input
              type="number"
              step="0.1"
              {...form.register("target_weight")}
            />
          </Field>
          <Field label="Experience">
            <select {...form.register("experience")}>
              {["Beginner", "Intermediate", "Advanced"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Available equipment">
            <select {...form.register("equipment")}>
              {["Gym", "Dumbbells", "Bodyweight"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Session duration · minutes">
            <input type="number" {...form.register("duration")} />
          </Field>
          <Field label="Your timezone">
            <input {...form.register("timezone")} />
          </Field>
        </div>
        <fieldset>
          <legend>Preferred training days</legend>
          <div className="day-picker">
            {weekdays.map((day, index) => (
              <button
                key={day}
                type="button"
                aria-pressed={days.includes(index)}
                onClick={() =>
                  form.setValue(
                    "days",
                    days.includes(index)
                      ? days.filter((d) => d !== index)
                      : [...days, index],
                    { shouldValidate: true },
                  )
                }
              >
                {day}
              </button>
            ))}
          </div>
        </fieldset>
        <Field
          label="Exercise dislikes or restrictions"
          hint="These notes are retained for your reference. Generated plans cannot assess injuries or automatically interpret medical restrictions."
        >
          <textarea
            {...form.register("restrictions")}
            placeholder="Anything you want to keep in mind…"
          />
        </Field>
        <Field label="3D display">
          <select {...form.register("quality")}>
            <option value="auto">Adaptive 3D</option>
            <option value="static">Static · lower battery use</option>
          </select>
        </Field>
        {Object.values(form.formState.errors).map((err, i) => (
          <Notice error key={i}>
            {String(err?.message || "Check your profile inputs.")}
          </Notice>
        ))}
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <div className="actions">
          <Button type="submit" disabled={save.isPending}>
            <Save size={16} />
            {save.isPending ? "Saving…" : "Save preferences"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || templates.isPending}
            onClick={generate}
          >
            {busy ? "Creating plan…" : "Generate a starter plan"}
          </Button>
        </div>
        <small>
          Creates new templates and a seven-day schedule. Existing workouts and
          history are kept. Review every exercise before training, especially if
          you have restrictions.
        </small>
      </form>
      <section className="panel data-settings">
        <h2>Your data, your choice.</h2>
        <p>
          {local
            ? "This workspace is saved in IndexedDB on this browser. Clearing browser data removes it. It does not automatically transfer to a cloud account."
            : "Your records are tied to your authenticated Supabase account."}
        </p>
        <Button variant="outline" onClick={exportData}>
          <Download size={16} />
          Export my records
        </Button>
        <hr />
        {confirmDelete ? (
          <div>
            <Notice error>
              This permanently deletes{" "}
              {local
                ? "this device workspace"
                : "your account and cloud records"}
              . Export a backup first.
            </Notice>
            <div className="actions">
              <Button
                variant="destructive"
                disabled={busy}
                onClick={deleteAccount}
              >
                Delete permanently
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Keep my data
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={16} />
            Delete {local ? "local workspace" : "account"}
          </Button>
        )}
      </section>
    </>
  );
}
