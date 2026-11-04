import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Brand } from "../components/Shell";
import { Button } from "../components/ui/button";
const sections = [
  {
    id: "training",
    title: "Train with a plan.",
    intro: "From the routine you choose to the last set you log.",
    items: [
      {
        title: "Workouts that fit you",
        text: "Build and edit your own routines, or choose a training program inside your account.",
      },
      {
        title: "Every set, in context",
        text: "Log reps, load and effort. Compare your previous session and reuse a load when you choose.",
      },
      {
        title: "Guidance close at hand",
        text: "Find exercise photographs, movement cues and muscle-group guides. Pause a session and pick up where you left off.",
      },
    ],
  },
  {
    id: "nutrition",
    title: "Keep your fuel in view.",
    intro: "A daily diary, with values and targets you control.",
    items: [
      {
        title: "Meals and macros",
        text: "Record meals, serving sizes and nutrition from your labels or cited sources. See your daily calories and macros together.",
      },
      {
        title: "Hydration and targets",
        text: "Log water through the day and set your own nutrition goals. Review and apply program calculations inside your account.",
      },
    ],
  },
  {
    id: "progress",
    title: "Follow the work you put in.",
    intro: "Your own records make the bigger picture.",
    items: [
      {
        title: "Training consistency",
        text: "Plan sessions, reschedule when life changes, and keep a calendar of training, partial sessions and rest days.",
      },
      {
        title: "Measurements over time",
        text: "Record weight and body measurements. Review your weight trend, completed sessions and lifting volume.",
      },
      {
        title: "Your records to keep",
        text: "Export a backup or delete your records in Settings. Your workout history stays separate from changes to your plans.",
      },
    ],
  },
];
export default function Features() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash)
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, [hash]);
  return (
    <div className="public-document feature-overview">
      <a className="skip-link" href="#features-main">
        Skip to content
      </a>
      <nav aria-label="Main navigation">
        <Brand />
        <Button asChild variant="outline">
          <Link to="/auth">
            Sign in <ArrowUpRight size={16} />
          </Link>
        </Button>
      </nav>
      <main id="features-main">
        <header className="feature-overview-heading">
          <h1>
            Your daily practice.
            <br />
            <em>One place to build it.</em>
          </h1>
          <p>
            LMQ brings your workouts, nutrition and progress together. Create an
            account to make it your own.
          </p>
          <Button asChild>
            <Link to="/auth?mode=signup">
              Create your account <ArrowRight size={17} />
            </Link>
          </Button>
        </header>
        <nav className="feature-overview-index" aria-label="Explore features">
          <a href="#training">
            Training <ArrowRight size={15} />
          </a>
          <a href="#nutrition">
            Nutrition <ArrowRight size={15} />
          </a>
          <a href="#progress">
            Progress <ArrowRight size={15} />
          </a>
        </nav>
        {sections.map((section) => (
          <section
            className="feature-overview-section"
            id={section.id}
            key={section.id}
          >
            <div>
              <h2>{section.title}</h2>
              <p>{section.intro}</p>
            </div>
            <dl>
              {section.items.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <section className="feature-overview-start">
          <h2>Ready for your next session?</h2>
          <p>
            Your programs and full training workspace are available after
            sign-in.
          </p>
          <Button asChild>
            <Link to="/auth?mode=signup">
              Create your account <ArrowRight size={17} />
            </Link>
          </Button>
          <Link to="/auth">Already a member? Sign in</Link>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <span>Train. Fuel. Evolve.</span>
        <Link to="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
