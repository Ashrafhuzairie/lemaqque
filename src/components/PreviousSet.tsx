import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  historyDate,
  type PreviousSet as History,
} from "../lib/workout-history";

export default function PreviousSet({
  previous,
  timezone,
  disabled,
  copied,
  compact = false,
  onReuse,
}: {
  previous: History;
  timezone?: string;
  disabled: boolean;
  copied: boolean;
  compact?: boolean;
  onReuse: () => void;
}) {
  const parts = previous.log.segments;
  const loads = parts ? parts.filter((part) => part.unit === "reps").length : 1;
  return (
    <div className={`previous-set ${compact ? "previous-set-compact" : ""}`}>
      <div className="previous-set-heading">
        <p>
          Last time ·{" "}
          <time dateTime={previous.completedAt}>
            {historyDate(previous.completedAt, timezone)}
          </time>
        </p>
        {loads > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onReuse}
          >
            <RotateCcw size={14} aria-hidden="true" />
            Use previous {loads === 1 ? "load" : "loads"}
          </Button>
        )}
      </div>
      {parts ? (
        <ul className="previous-set-parts">
          {parts.map((part, i) => (
            <li key={i}>
              <span>{part.label}</span>
              <strong>
                {part.reps}{" "}
                {part.unit === "seconds"
                  ? "sec"
                  : `reps · ${part.weight} kg ${part.multiplier === 2 ? "per side" : "total"}`}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="previous-set-performance">
          {previous.log.reps}{" "}
          {previous.log.exercise_id === "plank" ? "sec" : "reps"} ·{" "}
          {previous.log.weight} kg
        </p>
      )}
      <p className="previous-set-effort">
        Previous effort: {previous.log.rpe}/10 RPE
      </p>
      {copied && (
        <p className="previous-load-status" role="status">
          Previous loads filled. Reps and effort stay as entered.
        </p>
      )}
    </div>
  );
}
