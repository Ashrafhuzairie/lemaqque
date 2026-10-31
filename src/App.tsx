import { Component, Suspense, lazy, type ReactNode } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import { Pending, Notice } from "./components/common";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
const Workouts = lazy(() =>
    import("./pages/Workouts").then((m) => ({ default: m.Workouts })),
  ),
  Builder = lazy(() =>
    import("./pages/Workouts").then((m) => ({ default: m.Builder })),
  ),
  Session = lazy(() =>
    import("./pages/Workouts").then((m) => ({ default: m.ActiveWorkout })),
  );
const Settings = lazy(() => import("./pages/Settings")),
  Nutrition = lazy(() => import("./pages/Nutrition")),
  Attendance = lazy(() => import("./pages/Attendance")),
  Progress = lazy(() => import("./pages/Progress")),
  Coach = lazy(() => import("./pages/Coach")),
  Programs = lazy(() => import("./pages/Programs"));
const Library = lazy(() =>
    import("./pages/Library").then((m) => ({ default: m.Library })),
  ),
  Muscles = lazy(() =>
    import("./pages/Library").then((m) => ({ default: m.Muscles })),
  ),
  Privacy = lazy(() =>
    import("./pages/Public").then((m) => ({ default: m.Privacy })),
  ),
  Pricing = lazy(() =>
    import("./pages/Public").then((m) => ({ default: m.Pricing })),
  ),
  PublicPrograms = lazy(() =>
    import("./pages/Public").then((m) => ({ default: m.PublicPrograms })),
  );
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }
  render() {
    if (this.state.error)
      return (
        <div className="fatal-error">
          <h1>Something needs a reset.</h1>
          <Notice error>{this.state.error}</Notice>
          <p>Your saved records have not been deleted.</p>
          <button onClick={() => location.reload()}>
            Reload the application
          </button>
          <Link to="/">Return home</Link>
        </div>
      );
    return this.props.children;
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Pending />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/features" element={<Landing />} />
          <Route path="/programs" element={<PublicPrograms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/app" element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="builder" element={<Builder />} />
            <Route path="session/:id" element={<Session />} />
            <Route path="nutrition" element={<Nutrition />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="progress" element={<Progress />} />
            <Route path="library" element={<Library />} />
            <Route path="muscles" element={<Muscles />} />
            <Route path="programs" element={<Programs />} />
            <Route path="coach" element={<Coach />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="fatal-error">
                <h1>A little off track.</h1>
                <p>This page doesn’t exist.</p>
                <Link to="/app">Back to your workspace</Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
