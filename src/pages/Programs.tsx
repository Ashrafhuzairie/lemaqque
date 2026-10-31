import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Dumbbell } from "lucide-react";
import { Button } from "../components/ui/button";
import { PageHead, Notice } from "../components/common";
import { useStore, useSave, identity } from "../lib/store";
import { findExercise } from "../lib/catalog";
const programs = [
  {
    name: "The foundation",
    split: "Full Body",
    level: "Beginner",
    days: "3 days / week",
    description:
      "A balanced, repeatable introduction to resistance training. Learn the movements before chasing the load.",
    ids: ["squat", "incline", "row", "rdl", "plank"],
  },
  {
    name: "Balanced development",
    split: "Upper/Lower",
    level: "Intermediate",
    days: "4 days / week",
    description:
      "An original upper-body template emphasizing balanced chest, back and shoulder work. Pair with lower-body days.",
    ids: ["incline", "row", "press", "pulldown", "curl"],
  },
  {
    name: "Width & control",
    split: "Push/Pull/Legs",
    level: "Advanced",
    days: "3–5 days / week",
    description:
      "An original upper-body accessory session built around back width, deltoids and controlled repetitions. Scale volume to recovery.",
    ids: ["pulldown", "raise", "incline", "row", "pushdown"],
  },
];
export default function Programs({
  publicPage = false,
}: {
  publicPage?: boolean;
}) {
  const { userId } = useStore();
  const save = useSave("workout_templates");
  const [saved, setSaved] = useState<string[]>([]),
    [error, setError] = useState("");
  return (
    <>
      <PageHead
        title="A starting point. Not a limit."
        description="Original training templates, designed to be adapted to your experience and recovery."
      />
      {error && <Notice error>{error}</Notice>}
      <div className="program-list">
        {programs.map((p, i) => (
          <article className="program-card" key={p.name}>
            <div className={"program-visual program-visual-" + i}>
              <Dumbbell size={84} strokeWidth={0.7} />
              <span>{p.level.toUpperCase()}</span>
            </div>
            <div>
              <span className="tag">
                {p.split} · {p.days}
              </span>
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <ul>
                {p.ids.map((id) => (
                  <li key={id}>
                    {findExercise(id).name}
                    <span>
                      {i === 0 ? 2 : 3} × {findExercise(id).reps}
                    </span>
                  </li>
                ))}
              </ul>
              {publicPage || !userId ? (
                <Button asChild>
                  <Link to="/auth?mode=signup">
                    Make it yours
                    <ArrowRight size={16} />
                  </Link>
                </Button>
              ) : (
                <Button
                  disabled={save.isPending || saved.includes(p.name)}
                  onClick={() =>
                    save.mutate(
                      {
                        ...identity(userId),
                        name: p.name,
                        split: p.split,
                        exercises: p.ids.map((id) => ({
                          exercise_id: id,
                          sets: i === 0 ? 2 : 3,
                          reps: findExercise(id).reps,
                          rest: 90,
                        })),
                      },
                      {
                        onSuccess: () => setSaved((old) => [...old, p.name]),
                        onError: (e) => setError(e.message),
                      },
                    )
                  }
                >
                  {saved.includes(p.name) ? (
                    <>
                      <Check size={16} />
                      Saved to my workouts
                    </>
                  ) : (
                    <>
                      Use this template
                      <ArrowRight size={16} />
                    </>
                  )}
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>Inspired by the discipline. Built for everyday training.</h2>
        <p>
          The brief identifies classic-physique balance and men’s-physique
          upper-body development as future curated directions, with Chris
          Bumstead and Jeremy Buendia as research references. These templates
          are original generic programs. No exact athlete routine, endorsement,
          or verified attribution is claimed.
        </p>
        <p>
          Verified source-backed athlete collections are pending editorial
          review. No athlete imagery is used. Beginners should start with the
          foundation and build gradually.
        </p>
      </section>
    </>
  );
}
