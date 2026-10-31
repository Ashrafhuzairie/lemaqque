import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Dumbbell,
  Flame,
  Plus,
  Sun,
  TrendingUp,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { DataGate, Empty, round, weekdays } from "../components/common";
import { useRows, useProfile } from "../lib/store";
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
      <div className="dashboard-heading">
        <div>
          <h1>
            {profile.profile
              ? `Good to see you, ${profile.profile.name.split(" ")[0]}.`
              : "Your strongest self starts here."}
          </h1>
          <p>A little intention. A little effort. A little closer.</p>
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
            <strong>Let’s find your starting point.</strong>
            <p>Tell us about your goals and build a routine that fits.</p>
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
        <section className="training-feature">
          <div className="training-feature-top">
            <Dumbbell size={28} strokeWidth={1} />
          </div>
          <div className="training-feature-copy">
            <h2>
              {active?.name || template?.name || "Make room for movement."}
            </h2>
            <p>
              {active ? "Unfinished session · " : ""}
              {template
                ? `${template.exercises.length} movements · ${template.exercises.reduce((a, e) => a + e.sets, 0)} working sets`
                : "Your routine starts with a plan that’s yours."}
            </p>
            <Button asChild>
              <Link
                to={
                  active
                    ? "/app/session/" + active.id
                    : template
                      ? "/app/workouts"
                      : "/app/settings"
                }
              >
                <span>
                  {active
                    ? "Resume workout"
                    : template
                      ? "Open my workout"
                      : "Build my routine"}
                </span>
                <ArrowUpRight size={18} />
              </Link>
            </Button>
          </div>
          <div className="training-sculpture" aria-hidden="true">
            <div />
            <div />
            <div />
            <span>LMQ</span>
          </div>
          <div className="training-feature-footer">
            <span>SHOW UP. DO THE WORK.</span>
            <span>TRAIN / FUEL / EVOLVE</span>
          </div>
        </section>
        <section className="panel weekly-panel">
          <header>
            <h2>Your week</h2>
            <Link to="/app/attendance" aria-label="Open attendance calendar">
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
                  aria-label={`${weekdays[i]}, ${a?.status || "not logged"}`}
                >
                  <span>{weekdays[i].slice(0, 1)}</span>
                  <strong>{Number(d.slice(-2))}</strong>
                  <i />
                </Link>
              );
            })}
          </div>
          <div className="weekly-bottom">
            <strong>
              {attendance.data?.filter(
                (a) => week.includes(a.day) && a.status === "completed",
              ).length || 0}
              <span> sessions logged this week</span>
            </strong>
            <p>
              {profile.profile?.days.length
                ? `You’re aiming for ${profile.profile.days.length} training days. Make room for recovery, too.`
                : "Find a training rhythm that fits your week."}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/app/attendance">
              Check in for today <Plus size={16} />
            </Link>
          </Button>
        </section>
      </div>
      <div className="dashboard-metrics">
        <section className="metric">
          <div>
            <Flame size={18} />
            <span>Daily energy</span>
            <Link to="/app/nutrition" aria-label="Open daily nutrition">
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <strong>
            {round(total.calories)}
            <small> kcal</small>
          </strong>
          <p>
            {target
              ? `${round(Math.max(0, target.calories - total.calories))} kcal to your target`
              : "No calorie target set"}
          </p>
          <div className="progress-track">
            <span
              style={{
                width: `${target ? Math.min(100, (total.calories / target.calories) * 100) : 0}%`,
              }}
            />
          </div>
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
          <span className="metric-caption">EVERY REP, RECORDED.</span>
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
            )[0]?.weight || "—"}
            <small> kg</small>
          </strong>
          <p>
            {measurements.data?.length
              ? "Your latest logged measurement"
              : "Your first check-in is waiting"}
          </p>
          <Link className="text-link" to="/app/progress">
            Log a measurement
            <Plus size={14} />
          </Link>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <header className="section-title">
            <h2>Coming up</h2>
            <Link to="/app/attendance">
              Your calendar
              <ArrowRight size={15} />
            </Link>
          </header>
          {!planned?.length ? (
            <Empty title="A little space for a plan.">
              Schedule your next session in the attendance calendar.
            </Empty>
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
        <section className="coach-note">
          <h2>
            Small steps.
            <br />
            Stronger habits.
          </h2>
          <p>
            {sessions.data?.some((s) => s.status === "completed")
              ? "Keep an eye on recovery, then build on the work you’ve already done."
              : "Start with a comfortable load and controlled repetitions. The first goal is a routine you can repeat."}
          </p>
          <Link to="/app/coach">
            A little guidance
            <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
    </DataGate>
  );
}
