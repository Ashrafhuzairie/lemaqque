import { useState, useRef, useEffect } from "react";
import {
  NavLink,
  Outlet,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronRight,
  ChevronDown,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  Settings,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { CloudSetupError } from "../lib/cloud-errors";
import { useStore, useProfile } from "../lib/store";
import { Button } from "./ui/button";
import { Notice, Pending } from "./common";
const navigation = [
  { name: "Overview", path: "/app", icon: LayoutDashboard, end: true },
  { name: "My workouts", path: "/app/workouts", icon: Dumbbell },
  { name: "Exercise library", path: "/app/library", icon: Activity },
  { name: "Muscle explorer", path: "/app/muscles", icon: ScanLine },
  { name: "Training programs", path: "/app/programs", icon: Flame },
  { name: "Nutrition", path: "/app/nutrition", icon: Utensils },
  { name: "Attendance", path: "/app/attendance", icon: CalendarDays },
  { name: "Progress", path: "/app/progress", icon: ChartNoAxesCombined },
  { name: "Smart coach", path: "/app/coach", icon: Sparkles },
];
export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="LÉMAQQUE home">
      <img
        className="brand-icon"
        src="/brand/lmq-icon.png"
        alt=""
        width="40"
        height="40"
      />
      <img
        className="brand-wordmark"
        src="/brand/lmq-wordmark.svg"
        alt=""
        width="76"
        height="36"
      />
    </Link>
  );
}
export default function Shell() {
  const { userId, accountId, ready, local, signOut, enterLocal, enterCloud } =
    useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const section =
    navigation.find((n) => n.path === pathname)?.name ??
    (pathname.includes("/session/")
      ? "Active session"
      : pathname.includes("builder")
        ? "Workout builder"
        : "Your profile");
  const profileState = useProfile();
  const { profile } = profileState;
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const [mobile, setMobile] = useState(
    () => matchMedia("(max-width:700px)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(max-width:700px)");
    const update = () => {
      setMobile(media.matches);
      if (!media.matches) setOpen(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sidebar = sidebarRef.current;
    const first = sidebar?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === "Tab") {
        const elements = Array.from(
          sidebar?.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',
          ) || [],
        );
        const first = elements[0],
          last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
      openerRef.current?.focus();
    };
  }, [mobile, open]);
  const [error, setError] = useState("");
  if (!ready) return <Pending />;
  if (!accountId || !userId) return <Navigate to="/auth" replace />;
  if (profileState.isPending) return <Pending />;
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="mobile-header" inert={mobile && open}>
        <Brand />
        <Button
          ref={openerRef}
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="workspace-navigation"
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
      </div>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        id="workspace-navigation"
        inert={mobile && !open}
        role={mobile ? "dialog" : undefined}
        aria-modal={mobile && open ? true : undefined}
        aria-label="Workspace navigation"
        className={`sidebar ${open ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-top">
          <Brand />
          <button
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="workspace-name">
          <span className="status-dot" />
          {local ? "Device workspace" : "Personal workspace"}
        </div>
        <nav aria-label="Main navigation">
          {navigation.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              end={n.end}
              onClick={() => setOpen(false)}
            >
              <n.icon size={19} />
              {n.name}
              <ChevronRight size={14} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink
            to="/app/settings"
            onClick={() => setOpen(false)}
            className="profile-link"
          >
            <div className="avatar">
              {(profile?.name || "LM").slice(0, 2).toUpperCase()}
            </div>
            <span>
              {profile?.name || "Your profile"}
              <small>{local ? "Stored on this device" : "Cloud account"}</small>
            </span>
            <Settings size={18} />
          </NavLink>
          <button
            className="sign-out"
            onClick={() => signOut().catch((e) => setError(e.message))}
          >
            <LogOut size={15} />
            {local ? "Leave workspace" : "Sign out"}
          </button>
        </div>
      </aside>
      <div className="app-body" inert={mobile && open}>
        <div className="topbar">
          <div className="workspace-breadcrumb">
            <Link to="/app">Workspace</Link>
            <ChevronRight size={13} />
            <span>{section}</span>
          </div>
          <div>
            <span className="status-dot" />
            {local
              ? "On-device storage"
              : profileState.error instanceof CloudSetupError
                ? "Cloud storage unavailable"
                : "Supabase connected"}
          </div>
        </div>
        <main id="main-content">
          {error && <Notice error>{error}</Notice>}
          {local && (
            <details className="local-storage-note">
              <summary>
                Saved on this device
                <ChevronDown size={14} />
              </summary>
              <p>
                Your records stay in this browser. Export a backup in Settings.
                <Link to="/app" onClick={enterCloud}>
                  Use cloud workspace
                  <ArrowUpRight size={13} />
                </Link>
              </p>
            </details>
          )}
          {profileState.error instanceof CloudSetupError ? (
            <section className="panel cloud-storage-fallback">
              <h1>Cloud storage needs setup.</h1>
              <p>
                You’re signed in, but this project’s cloud storage isn’t ready
                yet.
              </p>
              <Notice error>{profileState.error.message}</Notice>
              <div className="cloud-storage-actions">
                <Button
                  onClick={() => {
                    enterLocal();
                    navigate("/app");
                  }}
                >
                  Open device workspace
                  <ArrowUpRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  disabled={profileState.isFetching}
                  onClick={() => profileState.refetch()}
                >
                  {profileState.isFetching
                    ? "Checking cloud storage…"
                    : "Retry cloud connection"}
                </Button>
              </div>
              <p className="cloud-storage-explanation">
                The device workspace uses records saved in this browser. Account
                records stay separate; switching does not copy or delete them.
              </p>
            </section>
          ) : (
            <Outlet />
          )}
        </main>
        <footer className="app-footer">
          <span>LÉMAQQUE</span>
          <span>Train. Fuel. Evolve.</span>
          <Link to="/privacy">Privacy & your data</Link>
        </footer>
      </div>
    </div>
  );
}
