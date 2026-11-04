import { lazy, Suspense, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Dumbbell,
  Utensils,
  ChartNoAxesCombined,
} from "lucide-react";
import { gsap } from "gsap";
import { Brand } from "../components/Shell";
import { Button } from "../components/ui/button";
const PerformanceScene = lazy(() => import("../three/PerformanceScene"));
export default function Landing() {
  const header = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tween = gsap.fromTo(
      header.current,
      { filter: "blur(8px)", y: 12 },
      { filter: "blur(0px)", y: 0, duration: 1.3, ease: "expo.out" },
    );
    return () => {
      tween.kill();
    };
  }, []);
  return (
    <div className="landing">
      <a className="skip-link" href="#landing-main">
        Skip to content
      </a>
      <nav className="public-nav">
        <Brand />
        <div className="public-links">
          <a href="#approach">The approach</a>
          <Link to="/programs">Training programs</Link>
        </div>
        <Button asChild variant="outline">
          <Link to="/auth">
            Your workspace
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </nav>
      <main id="landing-main">
        <section className="hero">
          <div className="hero-copy">
            <h1 ref={header}>
              Build your
              <br />
              <em>strongest self.</em>
            </h1>
            <p>
              Training with intention. Nutrition with awareness.
              <br />
              Progress that belongs to you.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link to="/auth?mode=signup">
                  Start your journey
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
              <a href="#approach" className="text-link">
                Explore LÉMAQQUE
                <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-signature">
              <span>TRAIN.</span>
              <span>FUEL.</span>
              <span>EVOLVE.</span>
            </div>
          </div>
          <div className="hero-visual">
            <Suspense
              fallback={
                <div className="static-sculpture">
                  <img
                    src="/brand/lmq-icon.png"
                    alt=""
                    width="180"
                    height="180"
                  />
                </div>
              }
            >
              <PerformanceScene />
            </Suspense>
            <div className="hero-orbit-label">
              A DAILY PRACTICE.
              <br />
              AN EVOLVING YOU.
            </div>
          </div>
          <div className="hero-bottom">
            <span>INTENTION MEETS PERFORMANCE</span>
            <span>
              SCROLL TO FIND YOUR RHYTHM <ArrowDown size={13} />
            </span>
          </div>
        </section>
        <section id="approach" className="approach">
          <div className="approach-intro">
            <h2>
              Everything you need.
              <br />
              <em>Nothing in your way.</em>
            </h2>
            <p>
              One considered space for the work you do every day. Build a plan
              that fits your life, log what matters, and see how far you’ve
              come.
            </p>
          </div>
          <div className="feature-rows">
            {[
              {
                icon: Dumbbell,
                title: "Train with purpose.",
                text: "Build your own routine. Log sets, reps and load. Pick up an unfinished session without losing your place.",
                to: "/app/workouts",
              },
              {
                icon: Utensils,
                title: "Fuel with awareness.",
                text: "Your meals, macros and hydration, in one clear daily diary. Values from your sources, targets on your terms.",
                to: "/app/nutrition",
              },
              {
                icon: ChartNoAxesCombined,
                title: "See the bigger picture.",
                text: "Follow your real training and measurement history. Progress is more than a number on a scale.",
                to: "/app/progress",
              },
            ].map((f) => (
              <Link to={f.to} className="feature-row" key={f.title}>
                <f.icon size={28} strokeWidth={1.3} />
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
                <ArrowUpRight size={23} />
              </Link>
            ))}
          </div>
        </section>
        <section className="landing-statement">
          <Activity size={35} strokeWidth={1} />
          <h2>
            Consistency is built.
            <br />
            <em>One day at a time.</em>
          </h2>
          <p>
            No invented transformation. No impossible promise.
            <br />
            Just you, your routine, and the next good decision.
          </p>
          <Button asChild>
            <Link to="/auth?mode=signup">
              Find your starting point
              <ArrowRight size={17} />
            </Link>
          </Button>
        </section>
      </main>
      <footer className="public-footer">
        <Brand />
        <span>Train. Fuel. Evolve.</span>
        <div>
          <Link to="/privacy">Privacy</Link>
          <Link to="/programs">Training programs</Link>
        </div>
      </footer>
    </div>
  );
}
