import type { ReactNode } from "react";
import { ArrowUpRight, LoaderCircle, Plus, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
export function PageHead({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  );
}
export function Empty({
  title,
  children,
  action,
  to,
}: {
  title: string;
  children: ReactNode;
  action?: string;
  to?: string;
}) {
  return (
    <div className="empty">
      <div className="empty-mark">
        <Plus size={24} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
      {to && (
        <Button asChild>
          <Link to={to}>
            {action}
            <ArrowUpRight size={17} />
          </Link>
        </Button>
      )}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`notice ${error ? "notice-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {error && <AlertCircle size={17} />}
      <span>{children}</span>
    </div>
  );
}
export function Pending() {
  return (
    <div className="pending" role="status">
      <LoaderCircle className="spin" />
      Loading your records…
    </div>
  );
}
export function DataGate({
  queries,
  children,
}: {
  queries: {
    isPending: boolean;
    error: Error | null;
    refetch: () => unknown;
  }[];
  children: ReactNode;
}) {
  if (queries.some((q) => q.isPending)) return <Pending />;
  const error = queries.find((q) => q.error);
  if (error)
    return (
      <Notice error>
        {error.error?.message}{" "}
        <button onClick={() => queries.forEach((q) => q.refetch())}>
          Retry loading
        </button>
      </Notice>
    );
  return children;
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const round = (n: number) => Math.round(n).toLocaleString();
