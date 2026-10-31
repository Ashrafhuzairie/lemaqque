import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { DataGate, PageHead, Notice } from "../components/common";
import { useRows, useProfile } from "../lib/store";
import { progression, localDay } from "../lib/fitness";
import { findExercise } from "../lib/catalog";
export default function Coach() {
  const profile = useProfile(),
    sessions = useRows("workout_sessions"),
    logs = useRows("set_logs"),
    templates = useRows("workout_templates"),
    attendance = useRows("attendance_records");
  const today = localDay(new Date(), profile.profile?.timezone);
  const done =
    sessions.data
      ?.filter((s) => s.status === "completed")
      .sort((a, b) => b.started_at.localeCompare(a.started_at)) || [];
  const last = done[0];
  const lastLogs = logs.data?.filter((l) => l.session_id === last?.id) || [];
  return (
    <>
      <PageHead
        title="A little guidance. A clearer next step."
        description="Explainable recommendations, based on the records you actually log."
      />
      <DataGate queries={[profile, sessions, logs, templates, attendance]}>
        <div className="coach-intro">
          <Sparkles size={30} strokeWidth={1} />
          <h2>
            Your routine is personal.
            <br />
            Your guidance should be, too.
          </h2>
          <p>Rule-based coaching · No AI provider is connected</p>
        </div>
        <div className="coach-recommendations">
          <section className="panel">
            <span className="tag">TODAY’S DIRECTION</span>
            <h2>
              {attendance.data?.some(
                (a) => a.day === today && a.status === "completed",
              )
                ? "You showed up. Make room for recovery."
                : templates.data?.length
                  ? "Start with the plan you can repeat."
                  : "Build a manageable starting point."}
            </h2>
            <p>
              {last
                ? `Your last completed session was ${last.name} on ${localDay(new Date(last.started_at), profile.profile?.timezone)}. Check how you feel before training the same muscle groups again.`
                : "No completed session is logged yet. Choose a comfortable routine and focus on learning the movement."}
            </p>
            <Button asChild variant="outline">
              <Link
                to={templates.data?.length ? "/app/workouts" : "/app/settings"}
              >
                {templates.data?.length
                  ? "See my workouts"
                  : "Set my preferences"}
                <ArrowRight size={16} />
              </Link>
            </Button>
          </section>
          <section className="panel">
            <span className="tag">PROGRESSION CHECK</span>
            <h2>Earn the next increment.</h2>
            <p>
              Increase load only when you can maintain technique and recover
              between sessions. Suggestions never change your saved plan
              automatically.
            </p>
            {[...new Set(lastLogs.map((l) => l.exercise_id))].map((id) => (
              <div className="coach-rule" key={id}>
                <h3>{findExercise(id)?.name}</h3>
                <p>
                  {progression(
                    lastLogs.filter((l) => l.exercise_id === id),
                    findExercise(id)?.reps || 10,
                  )}
                </p>
              </div>
            ))}
            {!lastLogs.length && (
              <p className="muted">
                Log completed sets with reps and RPE to unlock a progression
                check.
              </p>
            )}
          </section>
          <section className="panel">
            <span className="tag">MAKE THE PLAN FIT</span>
            <h2>Three days beats an impossible five.</h2>
            <p>
              Update your preferred days and generate new starter templates if
              your availability changes. Existing templates and historical
              records are kept; you choose what to use.
            </p>
            <Button asChild variant="outline">
              <Link to="/app/settings">
                Adjust my preferences
                <ArrowRight size={16} />
              </Link>
            </Button>
          </section>
        </div>
        <Notice>
          General fitness guidance, not medical advice. The coach cannot
          diagnose injuries, assess recovery clinically, or prescribe a diet.
          Optional conversational AI is not enabled.
        </Notice>
      </DataGate>
    </>
  );
}
