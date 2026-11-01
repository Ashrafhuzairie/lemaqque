import { useState } from "react";
import { ChevronDown, ExternalLink, Images } from "lucide-react";
import { exerciseMedia, type ExerciseImage } from "../lib/exercise-media";

function ReferencePicture({ picture }: { picture: ExerciseImage }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="exercise-picture">
      {failed ? (
        <p className="picture-unavailable" role="status">
          Picture unavailable. Use the written checkpoints; workout controls
          remain available.
        </p>
      ) : (
        <a
          href={picture.src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Enlarge ${picture.alt} (opens in a new tab)`}
        >
          <img
            src={picture.src}
            width={picture.width}
            height={picture.height}
            alt={picture.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          <span className="picture-enlarge">
            <ExternalLink size={14} /> Enlarge
          </span>
        </a>
      )}
      <figcaption>{picture.label}</figcaption>
    </figure>
  );
}
export default function ExercisePictures({
  exerciseId,
  compact = false,
}: {
  exerciseId?: string;
  compact?: boolean;
}) {
  const entries = exerciseId ? exerciseMedia.exercises[exerciseId] : undefined;
  if (!entries?.length)
    return (
      <p className="picture-missing">
        <Images size={18} aria-hidden="true" />
        {exerciseMedia.missing[exerciseId ?? ""] ??
          "No matching picture is available for this movement. Use the written checkpoints."}
      </p>
    );
  return (
    <details className="exercise-pictures" open={!compact}>
      <summary>
        <span>
          <Images size={18} aria-hidden="true" /> Exercise pictures
          <small>
            {entries.length === 1
              ? "View the movement"
              : `${entries.length} movements · shown separately`}
          </small>
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="exercise-picture-content">
        <p className="picture-guidance">
          Compare the positions. Follow the prescribed range, tempo and sequence
          below. Select a picture to enlarge it.
        </p>
        <div className="exercise-reference-list">
          {entries.map((entry, index) => {
            const ref = exerciseMedia.references[entry.reference];
            const pictures = ref.images;
            const note = [entry.note, ref.photoNote].filter(Boolean).join(" ");
            return (
              <section
                className="exercise-reference"
                key={`${entry.reference}-${index}`}
              >
                <h4>{entry.label ?? ref.title}</h4>
                {note && <p className="picture-variation">{note}</p>}
                <div
                  className={`exercise-photo-grid ${pictures.length === 1 ? "single-picture" : ""}`}
                >
                  {pictures.map((picture) => (
                    <ReferencePicture key={picture.src} picture={picture} />
                  ))}
                </div>
                <div className="picture-credit">
                  {ref.source && (
                    <a
                      href={ref.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ref.source.name} · {ref.source.license}
                      <ExternalLink size={12} />
                    </a>
                  )}
                  {ref.drawing && (
                    <a
                      href={ref.drawing.src}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF drawing · p. {ref.drawing.page}
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </details>
  );
}
