import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { LoggedSegment, SetLog, SourceSet } from "../lib/types";
import { defaultSegmentLog } from "../lib/programs";
import { Button } from "./ui/button";
export default function SourceSetRow({
  number,
  source,
  log,
  disabled,
  onSave,
}: {
  number: number;
  source: SourceSet;
  log?: SetLog;
  disabled: boolean;
  onSave: (value: { segments: LoggedSegment[]; rpe: number }) => Promise<void>;
}) {
  const [parts, setParts] = useState<LoggedSegment[]>(
    () => log?.segments || source.segments.map(defaultSegmentLog),
  );
  const [rpe, setRpe] = useState(log?.rpe ?? 7);
  return (
    <details
      className={`source-set ${log?.completed ? "source-set-complete" : ""}`}
      open={(number === 1 && !log?.completed) || undefined}
    >
      <summary>
        <span>
          <strong>Set {number}</strong>
          {source.warmup && <span className="warmup-badge">Warm-up</span>}
          <span>{source.text}</span>
        </span>
        {log?.completed ? <Check size={18} /> : <ChevronDown size={18} />}
      </summary>
      <div
        className={`source-set-inputs ${parts.length === 1 ? "source-single-part" : ""}`}
      >
        {parts.map((part, i) => (
          <div className="source-segment" key={i}>
            <div>
              <strong>{part.label}</strong>
              <small>
                {source.segments[i]?.target}
                {part.multiplier === 2 ? " · per side" : ""}
              </small>
            </div>
            <label>
              <span>
                {part.unit === "seconds" ? "Actual seconds" : "Actual reps"}
              </span>
              <input
                aria-label={`${part.unit === "seconds" ? "Actual seconds" : "Actual reps"} · Set ${number} part ${i + 1}`}
                type="number"
                min={0}
                max={1000}
                value={part.reps}
                disabled={disabled || log?.completed}
                onChange={(e) =>
                  setParts((old) =>
                    old.map((p, j) =>
                      i === j ? { ...p, reps: Number(e.target.value) } : p,
                    ),
                  )
                }
              />
            </label>
            {part.unit === "reps" && (
              <label>
                <span>
                  {part.multiplier === 2
                    ? "Load · kg per side"
                    : "Load · kg total"}
                </span>
                <input
                  aria-label={`${part.multiplier === 2 ? "Load · kg per side" : "Load · kg total"} · Set ${number} part ${i + 1}`}
                  type="number"
                  min={0}
                  max={1000}
                  step={0.25}
                  value={part.weight}
                  disabled={disabled || log?.completed}
                  onChange={(e) =>
                    setParts((old) =>
                      old.map((p, j) =>
                        i === j ? { ...p, weight: Number(e.target.value) } : p,
                      ),
                    )
                  }
                />
              </label>
            )}
          </div>
        ))}
        <div className="source-set-footer">
          <label>
            <span>Set effort · RPE</span>
            <input
              aria-label={`Set effort · RPE · Set ${number}`}
              type="number"
              min={1}
              max={10}
              step={0.5}
              value={rpe}
              disabled={disabled || log?.completed}
              onChange={(e) => setRpe(Number(e.target.value))}
            />
          </label>
          <Button
            type="button"
            variant={log?.completed ? "outline" : "default"}
            disabled={disabled}
            onClick={() => onSave({ segments: parts, rpe })}
          >
            <Check size={16} />
            {log?.completed ? "Uncomplete" : "Complete"} set {number}
          </Button>
        </div>
        <details className="set-load-help">
          <summary>How to log load</summary>{" "}
          <p>
            Log what you actually perform. Source example pounds stay unchanged
            above; your load below is in kg. Use total external load for each
            repetition. For targets marked per side, enter the load used on one
            side; the app counts both sides. Other entries use total load;
            bodyweight without added load contributes 0 kg to external volume.
          </p>
        </details>
      </div>
    </details>
  );
}
