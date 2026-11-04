import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  Dumbbell,
  Flame,
  Trophy,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHead, Notice, DataGate } from "../components/common";
import SourcePrescription from "../components/SourcePrescription";
import ProgramNutrition from "../components/ProgramNutrition";
import { useStore, useRows } from "../lib/store";
import {
  allSourceWorkouts,
  programDefinitions,
  sourcePrescription,
  createSourceTemplates,
  type ProgramPhase,
  type ProgramWorkout,
} from "../lib/programs";
export default function Programs() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("program") || "bulk";
  const selected =
    programDefinitions.find((p) => p.id === selectedId) ||
    programDefinitions[0];
  const [phaseId, setPhaseId] = useState(""),
    [workoutId, setWorkoutId] = useState(""),
    [tab, setTab] = useState<"training" | "nutrition" | "cardio">("training");
  const phase =
    selected.phases.find((p) => p.id === phaseId) || selected.phases[0];
  const workout =
    phase.workouts.find((w) => w.id === workoutId) ||
    phase.workouts.find((w) => !w.name.startsWith("Abs")) ||
    phase.workouts[0];
  const { repo, userId, accountId, local } = useStore();
  const templates = useRows("workout_templates");
  const query = useQueryClient();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const canImport = !!accountId && !!userId;
  async function add(selection: typeof allSourceWorkouts) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const wanted = await createSourceTemplates(userId!, selection);
      const count = await repo.importTemplates(wanted);
      await query.invalidateQueries({
        queryKey: [local, userId, "workout_templates"],
      });
      setMessage(
        count
          ? `${count} exact source template${count === 1 ? "" : "s"} added to My workouts. Existing templates and history were kept.`
          : "These templates are already in My workouts. No duplicates or overwrites were created.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function choose(id: string) {
    setParams({ program: id });
    setPhaseId("");
    setWorkoutId("");
    setMessage("");
    setError("");
  }
  const present = (w: ProgramWorkout) =>
    templates.data?.some((t) =>
      t.exercises.some((e) => e.source?.workoutId === w.id),
    );
  return (
    <>
      <PageHead
        title="Train beyond ordinary."
        description="Your three uploaded programs. Source-linked sets, original prescriptions, and calculations you can inspect."
      >
        {canImport ? (
          <Button
            onClick={() => add(allSourceWorkouts)}
            disabled={busy || templates.isPending || !!templates.error}
          >
            <Download size={17} />
            {busy ? "Importing…" : "Add all 20 templates"}
          </Button>
        ) : (
          <Button asChild>
            <Link to="/auth">
              Open a workspace
              <ArrowUpRight size={16} />
            </Link>
          </Button>
        )}
      </PageHead>
      <div
        className="source-program-switch"
        role="group"
        aria-label="Choose a source program"
      >
        {programDefinitions.map((program, i) => (
          <button
            key={program.id}
            aria-pressed={selected.id === program.id}
            onClick={() => choose(program.id)}
            className={"book-choice book-choice-" + i}
          >
            {i === 0 ? (
              <Dumbbell size={26} />
            ) : i === 1 ? (
              <Trophy size={26} />
            ) : (
              <Flame size={26} />
            )}
            <strong>{program.title}</strong>
            <span>
              {program.duration} ·{" "}
              {program.phases.reduce((n, p) => n + p.workouts.length, 0)}{" "}
              templates
            </span>
            <ArrowUpRight size={20} />
          </button>
        ))}
      </div>
      <section className={"program-banner program-banner-" + selected.id}>
        <div>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
        </div>
        <div className="program-proof">
          <BookOpen size={22} />
          <span>
            FROM YOUR PDF
            <strong>
              {selected.phases.reduce(
                (n, p) =>
                  n + p.workouts.reduce((m, w) => m + w.exercises.length, 0),
                0,
              )}{" "}
              source blocks
            </strong>
          </span>
        </div>
      </section>
      {error && <Notice error>{error}</Notice>}
      {message && (
        <Notice>
          {message} <Link to="/app/workouts">Open My workouts →</Link>
        </Notice>
      )}
      {templates.error && canImport && (
        <Notice error>
          Your saved templates could not be loaded: {templates.error.message}
        </Notice>
      )}
      <div
        className="program-section-tabs"
        role="group"
        aria-label="Program content"
      >
        {(["training", "nutrition", "cardio"] as const).map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === "training"
              ? "Workout templates"
              : t === "nutrition"
                ? "Nutrition & calculations"
                : "Cardio protocol"}
          </button>
        ))}
      </div>
      {tab === "training" ? (
        <>
          <div className="phase-toolbar">
            <FieldSelect
              phases={selected.phases}
              value={phase.id}
              change={(id) => {
                setPhaseId(id);
                setWorkoutId("");
              }}
            />
            {canImport && (
              <Button
                variant="outline"
                disabled={busy || templates.isPending || !!templates.error}
                onClick={() =>
                  add(
                    phase.workouts.map((w) => ({
                      program: selected,
                      phase,
                      workout: w,
                    })),
                  )
                }
              >
                Add this phase
                <Download size={15} />
              </Button>
            )}
          </div>
          <div className="source-workout-layout">
            <nav className="source-workout-nav" aria-label="Source workouts">
              {phase.workouts.map((w) => (
                <button
                  key={w.id}
                  aria-pressed={workout.id === w.id}
                  onClick={() => setWorkoutId(w.id)}
                >
                  <div>
                    <strong>{w.name}</strong>
                    <small>
                      {w.exercises.length} blocks ·{" "}
                      {w.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                      incl. warm-ups
                    </small>
                  </div>
                  {present(w) ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
              ))}
            </nav>
            <section className="source-workout-detail">
              <header>
                <div>
                  <h2>{workout.name}</h2>
                  <p>
                    {selected.fileName} · PDF pp. {workout.pages.join(", ")}
                  </p>
                </div>
                {canImport && (
                  <Button
                    disabled={busy || templates.isPending || !!templates.error}
                    onClick={() => add([{ program: selected, phase, workout }])}
                  >
                    {present(workout) ? "Already saved" : "Add this workout"}
                    {present(workout) ? (
                      <Check size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                  </Button>
                )}
              </header>
              {workout.notes.length > 0 && (
                <Notice>{workout.notes.join(" ")}</Notice>
              )}
              {workout.exercises.map((e, i) => (
                <article className="source-movement" key={e.id}>
                  <header>
                    <span className="movement-order">{i + 1}</span>
                    <h3>{e.name}</h3>
                    <Link
                      to={"/app/library?exercise=" + e.id}
                      aria-label={"Open details for " + e.name}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </header>
                  <SourcePrescription
                    source={sourcePrescription(selected, phase, workout, e)}
                  />
                </article>
              ))}
            </section>
          </div>
          <details className="source-section">
            <summary>
              <span>Schedule & source notes</span>
              <ArrowRight size={16} />
            </summary>
            {selected.schedule.length > 0 && (
              <ul>
                {selected.schedule.map((day) => (
                  <li key={day}>{day}</li>
                ))}
              </ul>
            )}
            <ul>
              {selected.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </details>
        </>
      ) : tab === "nutrition" ? (
        <ProgramNutrition
          key={selected.id}
          program={selected}
          readOnly={!canImport}
        />
      ) : (
        <section className="panel">
          <h2>Cardio, as prescribed.</h2>
          {selected.cardio.length ? (
            selected.cardio.map((section) => (
              <div className="source-cardio" key={section.title}>
                <h3>{section.title}</h3>
                <small>
                  {selected.fileName} · PDF pp. {section.pages.join(", ")}
                </small>
                <ul>
                  {section.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>
              This PDF does not provide a separate cardio schedule. No duration
              or frequency has been invented.
            </p>
          )}
        </section>
      )}
      <p className="fine-print">
        Transcribed from the PDFs you supplied, attributed to Jeremy Buendia.
        This is your source library, not an official endorsement. PDF page
        numbers count file pages. Original example loads stay in pounds; log
        your own actual load in kg. Missing or inconsistent instructions remain
        explicitly identified.
      </p>
    </>
  );
}
function FieldSelect({
  phases,
  value,
  change,
}: {
  phases: ProgramPhase[];
  value: string;
  change: (id: string) => void;
}) {
  return (
    <label className="phase-select">
      <span>Training phase</span>
      <select
        aria-label="Training phase"
        value={value}
        onChange={(e) => change(e.target.value)}
      >
        {phases.map((p) => (
          <option key={p.id} value={p.id}>
            {p.weeks ? `Weeks ${p.weeks[0]}–${p.weeks[1]} · ` : ""}
            {p.title}
          </option>
        ))}
      </select>
    </label>
  );
}
