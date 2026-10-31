import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  PageHead,
  Field,
  Notice,
  DataGate,
  weekdays,
} from "../components/common";
import { useRows, useSave, useStore, useProfile, identity } from "../lib/store";
import { localDay, attendanceRate } from "../lib/fitness";
export default function Attendance() {
  const attendance = useRows("attendance_records"),
    schedule = useRows("scheduled_workouts"),
    templates = useRows("workout_templates");
  const save = useSave("attendance_records"),
    saveSchedule = useSave("scheduled_workouts");
  const { profile } = useProfile();
  const { userId } = useStore();
  const today = localDay(new Date(), profile?.timezone);
  const [month, setMonth] = useState(() => today.slice(0, 7));
  const [day, setDay] = useState(today);
  const [showPlan, setShowPlan] = useState(false);
  const [error, setError] = useState("");
  const start = new Date(month + "-01T12:00:00Z");
  const count = new Date(
    start.getUTCFullYear(),
    start.getUTCMonth() + 1,
    0,
  ).getDate();
  const offset = start.getUTCDay();
  const monthAttendance =
    attendance.data?.filter((a) => a.day.startsWith(month)) || [];
  const monthSchedule =
    schedule.data?.filter((s) => s.day.startsWith(month)) || [];
  const rate = attendanceRate(monthSchedule, monthAttendance, today);
  function changeMonth(n: number) {
    const d = new Date(start);
    d.setUTCMonth(d.getUTCMonth() + n);
    setMonth(d.toISOString().slice(0, 7));
  }
  async function log(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    const existing = attendance.data?.find((a) => a.day === day);
    try {
      if (day > today)
        throw Error(
          "Attendance can only be recorded for today or a past date. Schedule a future workout instead.",
        );
      await save.mutateAsync({
        ...identity(userId!),
        id: existing?.id || crypto.randomUUID(),
        day,
        status: f.get("status") as "completed" | "partial" | "rest",
        notes: String(f.get("notes")).slice(0, 1000),
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function plan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await saveSchedule.mutateAsync({
        ...identity(userId!),
        day: String(f.get("day")),
        template_id: String(f.get("template_id")) || null,
        status: "planned",
        notes: String(f.get("notes")).slice(0, 1000),
      });
      setShowPlan(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHead
        title="Show up for yourself."
        description="Consistency is a practice, not a perfect streak."
      >
        <Button onClick={() => setShowPlan(!showPlan)}>
          <Plus size={17} />
          Plan a session
        </Button>
      </PageHead>
      <DataGate queries={[attendance, schedule, templates]}>
        {error && <Notice error>{error}</Notice>}
        <div className="attendance-stats">
          <div>
            <strong>
              {monthAttendance.filter((a) => a.status === "completed").length}
            </strong>
            <span>training days logged</span>
          </div>
          <div>
            <strong>
              {monthAttendance.filter((a) => a.status === "rest").length}
            </strong>
            <span>intentional rest days</span>
          </div>
          <div>
            <strong>{rate === null ? "—" : rate + "%"}</strong>
            <span>due sessions attended</span>
          </div>
        </div>
        {showPlan && (
          <form className="panel" onSubmit={plan}>
            <h2>Make space for training.</h2>
            <div className="form-grid">
              <Field label="Date">
                <input name="day" type="date" defaultValue={day} required />
              </Field>
              <Field label="Workout">
                <select name="template_id">
                  <option value="">Custom session</option>
                  {templates.data?.map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <input name="notes" maxLength={1000} />
            </Field>
            <Button disabled={saveSchedule.isPending}>Schedule session</Button>
          </form>
        )}
        <div className="calendar-layout">
          <section className="panel calendar-panel">
            <header>
              <h2>
                {start.toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </h2>
              <div className="actions">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft size={19} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight size={19} />
                </Button>
              </div>
            </header>
            <div className="calendar-grid">
              {weekdays.map((d) => (
                <span className="calendar-label" key={d}>
                  {d}
                </span>
              ))}
              {Array.from({ length: offset }, (_, i) => (
                <span key={"blank" + i} />
              ))}
              {Array.from({ length: count }, (_, i) => {
                const date = month + "-" + String(i + 1).padStart(2, "0");
                const record = attendance.data?.find((a) => a.day === date);
                const planned = schedule.data?.some(
                  (s) => s.day === date && s.status === "planned",
                );
                return (
                  <button
                    key={date}
                    className={`${date === today ? "calendar-today" : ""} ${date === day ? "calendar-selected" : ""} calendar-${record?.status || ""}`}
                    aria-label={`${i + 1} ${month}, ${record?.status === "completed" ? "Trained" : record?.status === "rest" ? "Rest" : record?.status === "partial" ? "Partial" : planned ? "Planned" : "Not logged"}`}
                    aria-pressed={day === date}
                    onClick={() => setDay(date)}
                  >
                    <span>{i + 1}</span>
                    <span className="calendar-indicator">
                      {record?.status === "completed"
                        ? "Trained"
                        : record?.status === "rest"
                          ? "Rest"
                          : record?.status === "partial"
                            ? "Partial"
                            : planned
                              ? "Planned"
                              : ""}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span>
                <i className="legend-complete" />
                Trained
              </span>
              <span>
                <i className="legend-partial" />
                Partial
              </span>
              <span>
                <i className="legend-rest" />
                Rest
              </span>
            </div>
          </section>
          <section className="panel">
            <CalendarDays size={25} />
            <h2>
              {new Date(day + "T12:00:00Z").toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              })}
            </h2>
            <form onSubmit={log} key={day}>
              <Field label="Day status">
                <select
                  name="status"
                  defaultValue={
                    attendance.data?.find((a) => a.day === day)?.status ||
                    "completed"
                  }
                >
                  <option value="completed">Completed training</option>
                  <option value="partial">Partial training</option>
                  <option value="rest">Rest day</option>
                </select>
              </Field>
              <Field label="Your notes">
                <textarea
                  name="notes"
                  defaultValue={
                    attendance.data?.find((a) => a.day === day)?.notes || ""
                  }
                  placeholder="How did today feel?"
                  maxLength={1000}
                />
              </Field>
              <Button disabled={save.isPending || day > today}>
                {save.isPending ? "Saving…" : "Save day"}
              </Button>
            </form>
            <div className="scheduled-list">
              <h3>Scheduled</h3>
              {!schedule.data?.some((s) => s.day === day) ? (
                <p className="muted">Nothing scheduled.</p>
              ) : (
                schedule.data
                  ?.filter((s) => s.day === day)
                  .map((s) => (
                    <div key={s.id}>
                      <strong>
                        {templates.data?.find((t) => t.id === s.template_id)
                          ?.name || "Custom session"}
                      </strong>
                      <span>
                        {s.status === "planned" && s.day < today
                          ? "Due · no completion logged"
                          : s.status}
                      </span>
                      <label className="field">
                        <span>Reschedule</span>
                        <input
                          aria-label="Reschedule session"
                          type="date"
                          value={s.day}
                          onChange={(e) =>
                            saveSchedule.mutate(
                              { ...s, day: e.target.value },
                              { onError: (e) => setError(e.message) },
                            )
                          }
                        />
                      </label>
                      <select
                        aria-label="Scheduled session status"
                        value={s.status}
                        onChange={(e) =>
                          saveSchedule.mutate(
                            { ...s, status: e.target.value as typeof s.status },
                            { onError: (e) => setError(e.message) },
                          )
                        }
                      >
                        {[
                          "planned",
                          "completed",
                          "partial",
                          "rest",
                          "missed",
                        ].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>
        <p className="fine-print">
          Dates use{" "}
          {profile?.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone}
          . Rest days are excluded from attendance calculations. Unscheduled
          days are never marked missed.
        </p>
      </DataGate>
    </>
  );
}
