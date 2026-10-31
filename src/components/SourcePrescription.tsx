import ExercisePictures from "./ExercisePictures";
import { sourcePictureId } from "../lib/exercise-media";
import { BookOpen } from "lucide-react";
import { restLabel } from "../lib/programs";
import type { SourcePrescription as Source } from "../lib/types";
export default function SourcePrescription({
  source,
  compact = false,
  showPictures = true,
}: {
  source: Source;
  compact?: boolean;
  showPictures?: boolean;
}) {
  return (
    <div className={`source-prescription ${compact ? "source-compact" : ""}`}>
      <div className="source-reference">
        <BookOpen size={14} />
        <span>
          {source.fileName} · PDF p. {source.page}
        </span>
        <strong>{restLabel(source)}</strong>
      </div>
      {showPictures && (
        <ExercisePictures
          key={source.workoutId + source.name}
          exerciseId={sourcePictureId(source)}
          compact={compact}
        />
      )}
      <div className="table-scroll">
        <table>
          <caption className="sr-only">{source.name} exact source sets</caption>
          <thead>
            <tr>
              <th>Set</th>
              <th>Source prescription</th>
            </tr>
          </thead>
          <tbody>
            {source.rows.map((row, i) => (
              <tr key={i}>
                <td>
                  {i + 1}
                  {row.warmup && <span className="warmup-badge">Warm-up</span>}
                </td>
                <td>{row.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {source.notes.length > 0 && (
        <ul className="source-notes">
          {source.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
