import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Flame,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { DataGate, round, weekdays } from "../components/common";
import { useRows, useProfile } from "../lib/store";
import { findExercise } from "../lib/catalog";
import { localDay, nutritionTotals, volume } from "../lib/fitness";
export default function Dashboard() {
  const profile = useProfile(),
    templates = useRows("workout_templates"),
    sessions = useRows("workout_sessions"),
    meals = useRows("meal_entries"),
    targets = useRows("nutrition_targets"),
    attendance = useRows("attendance_records"),
    scheduled = useRows("scheduled_workouts"),
    measurements = useRows("body_measurements"),
    logs = useRows("set_logs");
  const today = localDay(new Date(), profile.profile?.timezone);
  const total = nutritionTotals(
    meals.data?.filter((m) => m.day === today) || [],
  );
  const target = targets.data?.[0];
  const active = sessions.data?.find((s) => s.status === "active");
  const planned = scheduled.data
    ?.filter((s) => s.day >= today && s.status === "planned")
    .sort((a, b) => a.day.localeCompare(b.day));
  const template =
    templates.data?.find((t) => t.id === planned?.[0]?.template_id) ||
    templates.data?.[0];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - d.getUTCDay() + i);
    return d.toISOString().slice(0, 10);
  });
  const movements = active?.exercises || template?.exercises || [];
  return (
    <DataGate
      queries={[
        profile,
        templates,
        sessions,
        meals,
        targets,
        attendance,
        scheduled,
        measurements,
        logs,
      ]}
    >
      <div className="dashboard-page">
        <div className="dashboard-heading">
          <div>
            <h1>
              {profile.profile
                ? `Good to see you, ${profile.profile.name.split(" ")[0]}.`
                : "Your training starts here."}
            </h1>
            <p>Your training, meals and next steps in one place.</p>
          </div>
          <div className="today-date">
            <CalendarDays size={18} />
            {new Date(today + "T12:00:00Z").toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "UTC",
            })}
          </div>
        </div>
        {!profile.profile && (
          <div className="resume-banner">
            <div>
              <strong>Start with a plan that fits.</strong>
              <p>Set your goals, available equipment and training days.</p>
            </div>
            <Button asChild>
              <Link to="/app/settings">
                Set up my profile
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        )}
        <div className="dashboard-main">
          <section className="dashboard-training">
            <header className="section-title">
              <h2>
                {active ? "Pick up where you left off" : "Your next session"}
              </h2>
              <Link to="/app/workouts">
                All workouts
                <ArrowUpRight size={17} />
              </Link>
            </header>
            {active || template ? (
              <>
                <div className="dashboard-plan-heading">
                  <div>
                    <h3>{active?.name || template?.name}</h3>
                    <p>
                      {movements.length} movements ·{" "}
                      {movements.reduce((n, e) => n + e.sets, 0)}{" "}
                      {movements.some((e) => e.source)
                        ? "sets incl. warm-ups"
                        : "sets"}
                    </p>
                  </div>
                  <Button asChild>
                    <Link
                      to={
                        active ? "/app/session/" + active.id : "/app/workouts"
                      }
                    >
                      {active ? "Resume workout" : "Open my workout"}
                      <ArrowRight size={17} />
                    </Link>
                  </Button>
                </div>
                <ol className="dashboard-movements">
                  {movements.slice(0, 4).map((item, i) => (
                    <li key={item.exercise_id + i}>
                      <Link to={"/app/library?exercise=" + item.exercise_id}>
                        {findExercise(item.exercise_id)?.name ||
                          "Exercise reference unavailable"}
                        <ArrowUpRight size={15} />
                      </Link>
                      <span>{item.sets} sets</span>
                    </li>
                  ))}
                </ol>
                {movements.length > 4 && (
                  <p className="dashboard-plan-more">
                    + {movements.length - 4} more{" "}
                    {movements.length === 5 ? "movement" : "movements"} in this
                    session
                  </p>
                )}
                <p className="dashboard-plan-note">
                  Follow the prescribed sets. Choose your own actual load.
                </p>
              </>
            ) : (
              <div className="dashboard-start">
                <Dumbbell size={34} strokeWidth={1.3} />
                <h3>Choose your first workout.</h3>
                <p>
                  Build your own plan or choose from the source programs in your
                  library.
                </p>
                <div className="dashboard-start-actions">
                  <Button asChild>
                    <Link to="/app/programs">
                      Browse training programs
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                  <Link className="text-link" to="/app/builder">
                    Build a workout
                    <Plus size={15} />
                  </Link>
                </div>
              </div>
            )}
          </section>
          <aside className="dashboard-aside">
            <section className="weekly-panel">
              <header>
                <h2>Your week</h2>
                <Link
                  to="/app/attendance"
                  aria-label="Open attendance calendar"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </header>
              <div className="week-days">
                {week.map((d, i) => {
                  const a = attendance.data?.find((a) => a.day === d);
                  return (
                    <Link
                      key={d}
                      to="/app/attendance"
                      className={`${d === today ? "week-today" : ""} ${a?.status === "completed" ? "week-done" : ""}`}
                      aria-current={d === today ? "date" : undefined}
                    >
                      <span>{weekdays[i]}</span>{" "}
                      <strong>{Number(d.slice(-2))}</strong>
                      <span className="sr-only">
                        , {a?.status || "not logged"}
                      </span>
                      <i aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
              <p className="week-summary">
                <strong>
                  {attendance.data?.filter(
                    (a) => week.includes(a.day) && a.status === "completed",
                  ).length || 0}
                </strong>{" "}
                sessions logged this week
              </p>
              <Link className="text-link" to="/app/attendance">
                Check in for today
                <Plus size={15} />
              </Link>
            </section>
            <section className="dashboard-fuel">
              <header className="section-title">
                <h2>Nutrition</h2>
                <Link to="/app/nutrition" aria-label="Open daily nutrition">
                  <ArrowUpRight size={18} />
                </Link>
              </header>
              <p>
                {meals.data?.some((m) => m.day === today)
                  ? `${round(total.calories)} kcal logged today`
                  : "No meals logged today."}
              </p>
              <p className="dashboard-small">
                {target
                  ? `${round(Math.max(0, target.calories - total.calories))} kcal to your target`
                  : "Set targets when you’re ready."}
              </p>
              <Button asChild variant="outline">
                <Link to="/app/nutrition">
                  Log a meal
                  <Plus size={15} />
                </Link>
              </Button>
            </section>
          </aside>
        </div>
        <div className="dashboard-metrics">
          <section className="metric">
            <div>
              <Flame size={18} />
              <span>Daily energy</span>
              <Link to="/app/nutrition" aria-label="View nutrition diary">
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <strong>
              {round(total.calories)}
              <small> kcal</small>
            </strong>
            <p>
              {target
                ? `Target: ${round(target.calories)} kcal`
                : "No calorie target set"}
            </p>
          </section>
          <section className="metric">
            <div>
              <Dumbbell size={18} />
              <span>Training volume</span>
              <Link to="/app/progress" aria-label="Open training progress">
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <strong>
              {round(
                volume(
                  (logs.data || []).filter((l) =>
                    sessions.data?.some(
                      (s) => s.id === l.session_id && s.status === "completed",
                    ),
                  ),
                ),
              )}
              <small> kg</small>
            </strong>
            <p>Across your completed workouts</p>
          </section>
          <section className="metric">
            <div>
              <TrendingUp size={18} />
              <span>Body weight</span>
              <Link to="/app/progress" aria-label="Open body measurements">
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <strong>
              {measurements.data?.toSorted((a, b) =>
                b.day.localeCompare(a.day),
              )[0]?.weight ?? "—"}
              <small> kg</small>
            </strong>
            <Link className="text-link" to="/app/progress">
              Log a measurement
              <Plus size={14} />
            </Link>
          </section>
        </div>
        <section className="dashboard-schedule">
          <header className="section-title">
            <h2>Coming up</h2>
            <Link to="/app/attendance">
              Your calendar
              <ArrowRight size={15} />
            </Link>
          </header>
          {!planned?.length ? (
            <div className="dashboard-schedule-empty">
              <p>No upcoming sessions scheduled.</p>
              <Link className="text-link" to="/app/attendance">
                Plan your next session
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="record-list">
              {planned.slice(0, 3).map((s) => (
                <Link to="/app/workouts" key={s.id}>
                  <div className="schedule-date">
                    <strong>{s.day.slice(-2)}</strong>
                    <span>
                      {new Date(s.day + "T12:00:00Z").toLocaleDateString(
                        undefined,
                        { month: "short", timeZone: "UTC" },
                      )}
                    </span>
                  </div>
                  <div>
                    <strong>
                      {templates.data?.find((t) => t.id === s.template_id)
                        ?.name || "Custom session"}
                    </strong>
                    <small>Planned · {s.notes || "Your time to train"}</small>
                  </div>
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          )}
        </section>
        <div className="dashboard-coach-link">
          <p>Need help choosing your next step?</p>
          <Link className="text-link" to="/app/coach">
            Open Smart coach
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </DataGate>
  );
}
