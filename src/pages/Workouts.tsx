import ExercisePictures from "../components/ExercisePictures";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Dumbbell,
  Pause,
  Play,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
  Timer,
  Flag,
  Search,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DataGate,
  Empty,
  Field,
  Notice,
  PageHead,
  round,
} from "../components/common";
import {
  identity,
  useRows,
  useSave,
  useRemove,
  useStore,
  useProfile,
} from "../lib/store";
import { exercises, findExercise, splits } from "../lib/catalog";
import { exerciseThumbnail } from "../lib/exercise-media";
import { sourceExercises, restLabel } from "../lib/programs";
import SourcePrescription from "../components/SourcePrescription";
import SourceSetRow from "../components/SourceSetRow";
import { elapsed, formatTime, localDay, volume } from "../lib/fitness";
import {
  templateSchema,
  setSchema,
  sourceSetLogSchema,
} from "../lib/validation";
import type { Prescription, Session, Template } from "../lib/types";
export function Workouts() {
  const query = useRows("workout_templates"),
    sessions = useRows("workout_sessions");
  const remove = useRemove("workout_templates");
  const save = useSave("workout_templates");
  const saveSession = useSave("workout_sessions");
  const { userId } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const programs = [
    ...new Map(
      (query.data ?? []).flatMap((t) => {
        const source = t.exercises.find((e) => e.source)?.source;
        return source ? [[source.programId, source.programTitle] as const] : [];
      }),
    ).entries(),
  ];
  const filtered = (query.data ?? []).filter(
    (t) =>
      (program === "all" ||
        (program === "custom"
          ? !t.exercises.some((e) => e.source)
          : t.exercises.some((e) => e.source?.programId === program))) &&
      (
        t.name +
        " " +
        t.split +
        " " +
        t.exercises
          .map((e) => findExercise(e.exercise_id)?.name ?? "")
          .join(" ")
      )
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selectedId = selected ?? filtered[0]?.id;

  async function start(t: Template) {
    try {
      const active = sessions.data?.find((s) => s.status === "active");
      if (active) {
        navigate("/app/session/" + active.id);
        return;
      }
      const session: Session = {
        ...identity(userId!),
        template_id: t.id,
        name: t.name,
        exercises: t.exercises,
        started_at: new Date().toISOString(),
        finished_at: null,
        paused_at: null,
        paused_ms: 0,
        status: "active",
      };
      await saveSession.mutateAsync(session);
      navigate("/app/session/" + session.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHead
        title="My workouts"
        description="Choose a plan, check the movements, start your session."
      >
        <Button asChild variant="outline">
          <Link to="/app/builder">
            <Plus size={17} />
            Build a workout
          </Link>
        </Button>
      </PageHead>
      {error && <Notice error>{error}</Notice>}
      <DataGate queries={[query, sessions]}>
        {sessions.data
          ?.filter((s) => s.status === "active")
          .map((s) => (
            <div className="resume-banner" key={s.id}>
              <div>
                <span className="status-dot" />
                Workout in progress<strong>{s.name}</strong>
              </div>
              <Button asChild>
                <Link to={"/app/session/" + s.id}>
                  Resume session <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          ))}
        {!query.data?.length ? (
          <Empty
            title="Your next chapter starts here."
            action="Set up my training plan"
            to="/app/settings"
          >
            Generate a plan from your preferences, or build a workout from
            scratch.
          </Empty>
        ) : (
          <>
            <div className="workout-toolbar">
              <Field label="Find a workout">
                <div className="search-field">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelected(null);
                    }}
                    placeholder="Search plans or movements…"
                  />
                </div>
              </Field>
              <Field label="Program">
                <select
                  aria-label="Program"
                  value={program}
                  onChange={(e) => {
                    setProgram(e.target.value);
                    setSelected(null);
                  }}
                >
                  <option value="all">All programs</option>
                  {programs.map(([id, title]) => (
                    <option key={id} value={id}>
                      {title}
                    </option>
                  ))}
                  <option value="custom">My custom plans</option>
                </select>
              </Field>
              <p className="workout-result-count" aria-live="polite">
                {filtered.length} of {query.data.length} saved plans
              </p>
            </div>
            <div className="workout-grid">
              {filtered.map((t) => {
                const expanded = selectedId === t.id;
                const source = t.exercises.find((e) => e.source)?.source;
                return (
                  <article
                    className={`workout-card ${expanded ? "workout-card-selected" : ""}`}
                    key={t.id}
                  >
                    <div className="workout-plan-header">
                      <div className="workout-details">
                        <h2>
                          <button
                            className="workout-select"
                            aria-expanded={expanded}
                            aria-controls={`plan-${t.id}`}
                            onClick={() => setSelected(expanded ? "" : t.id)}
                          >
                            {t.name}
                            <ChevronDown size={18} />
                          </button>
                        </h2>
                        <p>
                          {t.exercises.length}{" "}
                          {source ? "source blocks" : "exercises"}{" "}
                          <span>·</span>{" "}
                          {t.exercises.reduce((a, e) => a + e.sets, 0)}{" "}
                          {source ? "sets incl. warm-ups" : "sets"}
                        </p>
                        {source && (
                          <Link
                            className="source-template-link"
                            to={"/app/programs?program=" + source.programId}
                          >
                            {source.programTitle} · {source.phaseTitle}
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                      <div className="workout-plan-actions">
                        <Button
                          variant={expanded ? "default" : "outline"}
                          onClick={() => start(t)}
                          disabled={saveSession.isPending}
                        >
                          <Play size={15} />
                          Start workout
                        </Button>
                        <div className="workout-tools">
                          <Link to={"/app/builder?edit=" + t.id}>
                            Edit plan <ArrowRight size={14} />
                          </Link>
                          <button
                            aria-label={"Duplicate " + t.name}
                            onClick={() =>
                              save.mutate(
                                {
                                  ...t,
                                  ...identity(userId!),
                                  name: t.name + " · copy",
                                },
                                { onError: (e) => setError(e.message) },
                              )
                            }
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            aria-label={"Delete " + t.name}
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Delete this template? Past sessions are preserved.",
                                )
                              )
                                remove.mutate(t.id, {
                                  onError: (e) => setError(e.message),
                                });
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      id={`plan-${t.id}`}
                      hidden={!expanded}
                      className="workout-plan-preview"
                    >
                      <div className="plan-column-labels">
                        <span>Movement</span>
                        <span>Sets</span>
                        <span className="sr-only">Reference</span>
                      </div>
                      <ol className="plan-movements">
                        {t.exercises.map((p, i) => {
                          const exercise = findExercise(p.exercise_id);
                          const picture = exerciseThumbnail(p.exercise_id);
                          return (
                            <li key={`${p.exercise_id}-${i}`}>
                              <Link
                                className="plan-movement-name"
                                to={"/app/library?exercise=" + p.exercise_id}
                              >
                                {picture ? (
                                  <img
                                    src={picture.src}
                                    alt=""
                                    width={picture.width}
                                    height={picture.height}
                                    loading="lazy"
                                  />
                                ) : (
                                  <Dumbbell size={24} aria-hidden="true" />
                                )}
                                <span>
                                  {exercise?.name ??
                                    "Exercise reference unavailable"}
                                </span>
                              </Link>
                              <span className="plan-set-count">
                                {p.sets}
                                <small> sets</small>
                              </span>
                              <Link
                                className="plan-reference-link"
                                to={"/app/library?exercise=" + p.exercise_id}
                                aria-label={
                                  "View reference for " +
                                  (exercise?.name ?? "exercise")
                                }
                              >
                                View reference
                                <ArrowRight size={14} />
                              </Link>
                            </li>
                          );
                        })}
                      </ol>
                      {source && (
                        <p className="plan-source-caption">
                          Source set counts include warm-ups. Log your own
                          actual loads during the session.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="workout-no-results">
                <h2>No matching plans</h2>
                <p>Try another movement name or program.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setProgram("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </>
        )}
        <section className="section-space">
          <h2>Training history</h2>
          {!sessions.data?.some((s) => s.status === "completed") ? (
            <p className="muted">
              Finished sessions will appear here. Every set counts.
            </p>
          ) : (
            <div className="record-list">
              {sessions.data
                ?.filter((s) => s.status === "completed")
                .sort((a, b) => b.started_at.localeCompare(a.started_at))
                .map((s) => (
                  <Link key={s.id} to={"/app/session/" + s.id}>
                    <div>
                      <strong>{s.name}</strong>
                      <small>
                        {new Date(s.started_at).toLocaleDateString()} ·{" "}
                        {formatTime(elapsed(s))}
                      </small>
                    </div>
                    <ArrowRight size={18} />
                  </Link>
                ))}
            </div>
          )}
        </section>
      </DataGate>
    </>
  );
}
export function Builder() {
  const [params] = useSearchParams();
  const query = useRows("workout_templates");
  const save = useSave("workout_templates");
  const { userId } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [split, setSplit] = useState("Full Body");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const edit = query.data?.find((t) => t.id === params.get("edit"));
  useEffect(() => {
    if (edit) {
      setName(edit.name);
      setSplit(edit.split);
      setPrescriptions(edit.exercises);
    }
  }, [edit]);
  function change(
    index: number,
    key: keyof Prescription,
    value: string | number,
  ) {
    setPrescriptions((p) =>
      p.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const values = templateSchema.parse({
        name,
        split,
        exercises: prescriptions,
      });
      await save.mutateAsync({
        ...values,
        id: edit?.id || crypto.randomUUID(),
        user_id: userId!,
      });
      navigate("/app/workouts");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHead
        title={edit ? "Refine your routine." : "Build with intention."}
        description="Custom movements are editable. Imported source blocks keep every prescribed set; reordering or removing them adapts your personal copy."
      />
      <DataGate queries={[query]}>
        <form onSubmit={submit} className="builder-grid">
          <section className="panel">
            <div className="form-grid">
              <Field label="Workout name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Monday · full body"
                  required
                  maxLength={100}
                />
              </Field>
              <Field label="Training split">
                <select
                  value={split}
                  onChange={(e) => setSplit(e.target.value)}
                >
                  {!splits.includes(split) && (
                    <option value={split}>{split}</option>
                  )}
                  {splits.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="exercise-prescriptions">
              {prescriptions.length === 0 && (
                <p className="muted">
                  Add an exercise from the library to begin.
                </p>
              )}
              {prescriptions.map((p, i) => (
                <div className="prescription" key={p.exercise_id + "-" + i}>
                  <div className="prescription-heading">
                    <strong>{findExercise(p.exercise_id)?.name}</strong>
                    <div>
                      <button
                        type="button"
                        aria-label="Move exercise up"
                        disabled={i === 0}
                        onClick={() =>
                          setPrescriptions((old) => {
                            const copy = [...old];
                            [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                            return copy;
                          })
                        }
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Move exercise down"
                        disabled={i === prescriptions.length - 1}
                        onClick={() =>
                          setPrescriptions((old) => {
                            const copy = [...old];
                            [copy[i + 1], copy[i]] = [copy[i], copy[i + 1]];
                            return copy;
                          })
                        }
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove exercise"
                        onClick={() =>
                          setPrescriptions((old) =>
                            old.filter((_, j) => j !== i),
                          )
                        }
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                  {p.source ? (
                    <SourcePrescription source={p.source} compact />
                  ) : (
                    <div className="prescription-fields">
                      <Field label="Sets">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={p.sets}
                          onChange={(e) =>
                            change(i, "sets", Number(e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Target reps">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={p.reps}
                          onChange={(e) =>
                            change(i, "reps", Number(e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Rest · sec">
                        <input
                          type="number"
                          min={15}
                          max={600}
                          value={p.rest}
                          onChange={(e) =>
                            change(i, "rest", Number(e.target.value))
                          }
                        />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {error && <Notice error>{error}</Notice>}
            <Button type="submit" disabled={save.isPending}>
              <Save size={16} />
              {save.isPending ? "Saving…" : "Save workout"}
            </Button>
          </section>
          <section className="panel">
            <h2>Movement library</h2>
            <Field label="Search exercises">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Exercise, muscle or equipment"
              />
            </Field>
            <div className="exercise-picker">
              {[...exercises, ...sourceExercises]
                .filter((e) =>
                  (e.name + " " + e.muscle + " " + e.equipment)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    disabled={prescriptions.some((p) => p.exercise_id === e.id)}
                    onClick={() =>
                      setPrescriptions((p) => [
                        ...p,
                        {
                          exercise_id: e.id,
                          sets: e.sets,
                          reps: e.reps,
                          rest: e.rest,
                          ...(e.prescription ? { source: e.prescription } : {}),
                        },
                      ])
                    }
                  >
                    <div>
                      <strong>{e.name}</strong>
                      <small>
                        {e.muscle} · {e.equipment}
                      </small>
                    </div>
                    <Plus size={17} />
                  </button>
                ))}
            </div>
          </section>
        </form>
      </DataGate>
    </>
  );
}
function XIcon() {
  return <Trash2 size={15} />;
}
export function ActiveWorkout() {
  const { id } = useParams();
  const sessions = useRows("workout_sessions"),
    templates = useRows("workout_templates"),
    logs = useRows("set_logs");
  const saveLog = useSave("set_logs"),
    saveSession = useSave("workout_sessions"),
    saveAttendance = useSave("attendance_records");
  const attendance = useRows("attendance_records");
  const schedules = useRows("scheduled_workouts");
  const { repo, userId } = useStore();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [restUntil, setRestUntil] = useState(() =>
    Number(localStorage.getItem("lmq:rest:" + id) || 0),
  );
  const [index, setIndex] = useState(0);
  const [showDiscard, setShowDiscard] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const session = sessions.data?.find((s) => s.id === id);
  const template = templates.data?.find((t) => t.id === session?.template_id);
  const sessionLogs = logs.data?.filter((s) => s.session_id === id) || [];
  const prescription = session?.exercises?.length
    ? session.exercises
    : template?.exercises;
  const ids = prescription?.map((e) => e.exercise_id) || [
    ...new Set(sessionLogs.map((s) => s.exercise_id)),
  ];
  const exerciseId = ids[index],
    exercise = findExercise(exerciseId);
  const completed = session?.status === "completed";
  const currentPrescription = prescription?.find(
    (e) => e.exercise_id === exerciseId,
  );
  async function togglePause() {
    if (!session) return;
    const stamp = new Date().toISOString();
    try {
      await saveSession.mutateAsync({
        ...session,
        paused_at: session.paused_at ? null : stamp,
        paused_ms:
          session.paused_ms +
          (session.paused_at ? Date.now() - Date.parse(session.paused_at) : 0),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function finish() {
    if (!session) return;
    setError("");
    setFinishing(true);
    try {
      await repo.finishWorkout(
        session.id,
        localDay(new Date(session.started_at), profile?.timezone),
      );
      await queryClient.invalidateQueries();
      localStorage.removeItem("lmq:rest:" + id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setFinishing(false);
    }
  }
  return (
    <div className="active-workout-page">
      <PageHead
        title={session?.name || "Your session."}
        description={
          completed
            ? "Session complete. Here’s the work you put in."
            : "Stay present. One controlled rep at a time."
        }
      >
        <Button asChild variant="outline">
          <Link to="/app/workouts">Back to workouts</Link>
        </Button>
      </PageHead>
      <DataGate queries={[sessions, templates, logs, attendance, schedules]}>
        {!session ? (
          <Empty title="Session not found.">
            Return to your workouts and start a new session.
          </Empty>
        ) : (
          <>
            <div className="session-summary">
              <div>
                <Timer size={19} />
                <span>
                  SESSION TIME
                  <strong>{formatTime(elapsed(session, now))}</strong>
                </span>
              </div>
              <div>
                <Check size={19} />
                <span>
                  SETS COMPLETE
                  <strong>
                    {sessionLogs.filter((s) => s.completed).length}
                  </strong>
                </span>
              </div>
              <div>
                <Dumbbell size={19} />
                <span>
                  VOLUME LIFTED
                  <strong>
                    {round(volume(sessionLogs))} <small>kg</small>
                  </strong>
                </span>
              </div>
              {!completed && (
                <Button
                  variant="outline"
                  onClick={togglePause}
                  disabled={saveSession.isPending}
                >
                  {session.paused_at ? <Play size={16} /> : <Pause size={16} />}{" "}
                  {session.paused_at ? "Resume" : "Pause"}
                </Button>
              )}
            </div>
            {error && <Notice error>{error}</Notice>}
            {session.paused_at && (
              <Notice>Session paused. Resume before logging more sets.</Notice>
            )}
            {completed ? (
              <div className="panel">
                <h2>Good work. Take it with you.</h2>
                <p>
                  {
                    new Set(
                      sessionLogs
                        .filter((s) => s.completed)
                        .map((s) => s.exercise_id),
                    ).size
                  }{" "}
                  exercises · {sessionLogs.filter((s) => s.completed).length}{" "}
                  sets stored.
                </p>
                <div className="record-list">
                  {sessionLogs
                    .filter((s) => s.completed)
                    .map((s) => (
                      <div key={s.id}>
                        <span>
                          {findExercise(s.exercise_id)?.name} · set{" "}
                          {s.set_number}
                        </span>
                        <strong>
                          {s.segments?.length
                            ? `${s.segments.filter((p) => p.unit === "reps").reduce((n, p) => n + p.reps * p.multiplier, 0)} reps · ${round(volume([s]))} kg volume`
                            : `${s.reps} × ${s.weight} kg`}
                        </strong>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="session-layout">
                <aside className="panel session-exercises">
                  <h2>Today’s movements</h2>
                  <label className="session-exercise-picker">
                    <span>Current exercise</span>
                    <select
                      aria-label="Current exercise"
                      value={index}
                      onChange={(event) => setIndex(Number(event.target.value))}
                    >
                      {ids.map((exerciseId, i) => (
                        <option key={exerciseId} value={i}>
                          {i + 1}.{" "}
                          {findExercise(exerciseId)?.name || "Exercise"}
                        </option>
                      ))}
                    </select>
                  </label>
                  {ids.map((exerciseId, i) => (
                    <button
                      key={exerciseId}
                      aria-pressed={index === i}
                      onClick={() => setIndex(i)}
                    >
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <strong>{findExercise(exerciseId)?.name}</strong>
                      {sessionLogs.some(
                        (l) => l.exercise_id === exerciseId && l.completed,
                      ) && <Check size={16} />}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    onClick={finish}
                    disabled={saveSession.isPending || finishing}
                  >
                    <Flag size={15} />
                    Finish workout
                  </Button>
                  <button
                    className="muted discard"
                    onClick={() => setShowDiscard(true)}
                  >
                    Discard session
                  </button>
                  {showDiscard && (
                    <div>
                      <Notice error>
                        This removes the unfinished session from your training
                        history.
                      </Notice>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          saveSession.mutate(
                            {
                              ...session,
                              status: "discarded",
                              finished_at: new Date().toISOString(),
                            },
                            {
                              onSuccess: () => navigate("/app/workouts"),
                              onError: (e) => setError(e.message),
                            },
                          )
                        }
                      >
                        Discard workout
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setShowDiscard(false)}
                      >
                        Keep training
                      </Button>
                    </div>
                  )}
                </aside>
                <section className="panel">
                  {exercise ? (
                    <>
                      <div className="exercise-title">
                        <div>
                          <h2>{exercise.name}</h2>
                          <p>
                            {exercise.muscle} ·{" "}
                            {currentPrescription?.source
                              ? `${currentPrescription.source.rows.length} source sets · ${restLabel(currentPrescription.source)}`
                              : `${currentPrescription?.sets || 3} sets · ${currentPrescription?.reps || 10} target reps · ${currentPrescription?.rest || 90}s rest`}
                          </p>
                        </div>
                        <Button asChild variant="ghost">
                          <Link to={"/app/library?exercise=" + exercise.id}>
                            Technique <ArrowRight size={15} />
                          </Link>
                        </Button>
                      </div>
                      <ExercisePictures
                        key={exercise.id}
                        exerciseId={exercise.id}
                        compact
                      />
                      <details>
                        <summary>
                          Movement checkpoints <ChevronDown size={15} />
                        </summary>
                        <ol>
                          {exercise.instructions.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                        <p>
                          Stop if you experience pain. Use a qualified coach for
                          individualized technique guidance.
                        </p>
                      </details>
                      {currentPrescription?.source ? (
                        <div className="source-active-plan">
                          <div className="session-set-heading">
                            <h3>Your sets</h3>
                            <span>
                              Actual load in kg ·{" "}
                              {restLabel(currentPrescription.source)}
                            </span>
                          </div>
                          {currentPrescription.source.rows.map(
                            (sourceSet, i) => {
                              const log = sessionLogs.find(
                                (l) =>
                                  l.exercise_id === exerciseId &&
                                  l.set_number === i + 1,
                              );
                              return (
                                <SourceSetRow
                                  key={
                                    exerciseId + "-" + i + "-" + (log?.id || "")
                                  }
                                  number={i + 1}
                                  source={sourceSet}
                                  log={log}
                                  disabled={
                                    !!session.paused_at || saveLog.isPending
                                  }
                                  onSave={async (value) => {
                                    try {
                                      setError("");
                                      const parsed =
                                        sourceSetLogSchema.parse(value);
                                      await saveLog.mutateAsync({
                                        ...identity(userId!),
                                        id: log?.id || crypto.randomUUID(),
                                        session_id: id!,
                                        exercise_id: exerciseId,
                                        set_number: i + 1,
                                        reps: 0,
                                        weight: 0,
                                        rpe: parsed.rpe,
                                        segments: parsed.segments,
                                        completed: !log?.completed,
                                      });
                                      const seconds =
                                        currentPrescription.source?.restMin;
                                      if (!log?.completed && seconds) {
                                        const until =
                                          Date.now() + seconds * 1000;
                                        setRestUntil(until);
                                        localStorage.setItem(
                                          "lmq:rest:" + id,
                                          String(until),
                                        );
                                      }
                                    } catch (e) {
                                      setError((e as Error).message);
                                    }
                                  }}
                                />
                              );
                            },
                          )}
                          <details className="session-source-notes">
                            <summary>
                              Full source prescription <ChevronDown size={15} />
                            </summary>
                            <SourcePrescription
                              source={currentPrescription.source}
                              showPictures={false}
                              compact
                            />
                          </details>
                          {currentPrescription.source.restMin !==
                            currentPrescription.source.restMax &&
                            currentPrescription.source.restMin !== null && (
                              <p className="fine-print">
                                The source specifies{" "}
                                {currentPrescription.source.restMin}–
                                {currentPrescription.source.restMax} seconds.
                                The countdown starts at the lower end; the full
                                source range remains visible.
                              </p>
                            )}
                        </div>
                      ) : (
                        <>
                          {" "}
                          <div className="set-labels">
                            <span>SET</span>
                            <span>REPS</span>
                            <span>KG</span>
                            <span>RPE</span>
                            <span>DONE</span>
                          </div>
                          {Array.from(
                            { length: currentPrescription?.sets || 3 },
                            (_, i) => {
                              const log = sessionLogs.find(
                                (l) =>
                                  l.exercise_id === exerciseId &&
                                  l.set_number === i + 1,
                              );
                              const previous = logs.data
                                ?.filter(
                                  (l) =>
                                    l.exercise_id === exerciseId &&
                                    l.session_id !== id &&
                                    l.completed,
                                )
                                .at(-1);
                              return (
                                <SetRow
                                  key={exerciseId + i + (log?.id || "")}
                                  number={i + 1}
                                  defaultReps={currentPrescription?.reps || 10}
                                  log={log}
                                  previous={
                                    previous
                                      ? `${previous.reps} × ${previous.weight} kg`
                                      : undefined
                                  }
                                  disabled={
                                    !!session.paused_at || saveLog.isPending
                                  }
                                  onSave={async (values) => {
                                    try {
                                      setError("");
                                      const parsed = setSchema.parse(values);
                                      await saveLog.mutateAsync({
                                        ...identity(userId!),
                                        id: log?.id || crypto.randomUUID(),
                                        session_id: id!,
                                        exercise_id: exerciseId,
                                        set_number: i + 1,
                                        ...parsed,
                                        completed: !log?.completed,
                                      });
                                      if (!log?.completed) {
                                        const until =
                                          Date.now() +
                                          (currentPrescription?.rest || 90) *
                                            1000;
                                        setRestUntil(until);
                                        localStorage.setItem(
                                          "lmq:rest:" + id,
                                          String(until),
                                        );
                                      }
                                    } catch (e) {
                                      setError((e as Error).message);
                                    }
                                  }}
                                />
                              );
                            },
                          )}
                        </>
                      )}
                      {restUntil > now && (
                        <div className="rest-timer" role="status">
                          <Timer size={20} />
                          <div>
                            REST & RESET
                            <strong>
                              {formatTime(Math.ceil((restUntil - now) / 1000))}
                            </strong>
                          </div>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setRestUntil(0);
                              localStorage.removeItem("lmq:rest:" + id);
                            }}
                          >
                            Skip rest
                          </Button>
                        </div>
                      )}
                      <div className="session-step-actions">
                        <Button
                          variant="ghost"
                          onClick={() => setIndex((i) => Math.max(0, i - 1))}
                          disabled={index === 0}
                        >
                          Previous exercise
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setIndex((i) => Math.min(i + 1, ids.length - 1))
                          }
                          disabled={index === ids.length - 1}
                        >
                          Next exercise <ArrowRight size={16} />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Notice>
                      The original template is unavailable. Finish a session
                      with existing logs, or discard this empty session.
                    </Notice>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </DataGate>
    </div>
  );
}
function SetRow({
  number,
  log,
  defaultReps,
  previous,
  disabled,
  onSave,
}: {
  number: number;
  log?: import("../lib/types").SetLog;
  defaultReps: number;
  previous?: string;
  disabled: boolean;
  onSave: (values: {
    reps: number;
    weight: number;
    rpe: number;
  }) => Promise<void>;
}) {
  const [reps, setReps] = useState(log?.reps ?? defaultReps),
    [weight, setWeight] = useState(log?.weight ?? 0),
    [rpe, setRpe] = useState(log?.rpe ?? 7);
  return (
    <div className={`set-row ${log?.completed ? "set-complete" : ""}`}>
      <span className="set-number">{number}</span>
      <input
        aria-label={`Set ${number} reps`}
        type="number"
        min={0}
        max={500}
        value={reps}
        disabled={disabled || log?.completed}
        onChange={(e) => setReps(Number(e.target.value))}
      />
      <input
        aria-label={`Set ${number} weight kg`}
        type="number"
        min={0}
        max={1000}
        step={0.5}
        value={weight}
        disabled={disabled || log?.completed}
        onChange={(e) => setWeight(Number(e.target.value))}
      />
      <input
        aria-label={`Set ${number} RPE`}
        type="number"
        min={1}
        max={10}
        step={0.5}
        value={rpe}
        disabled={disabled || log?.completed}
        onChange={(e) => setRpe(Number(e.target.value))}
      />
      <button
        aria-label={`${log?.completed ? "Uncomplete" : "Complete"} set ${number}`}
        aria-pressed={!!log?.completed}
        disabled={disabled}
        onClick={() => onSave({ reps, weight, rpe })}
      >
        <Check size={19} />
      </button>
      {previous && <small>Previous: {previous}</small>}
    </div>
  );
}
