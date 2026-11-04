import { lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { exercises, muscleGroups, findExercise } from "../lib/catalog";
import { useStore, useProfile } from "../lib/store";
import { Button } from "../components/ui/button";
import { PageHead, Field, Notice, DataGate } from "../components/common";
import SourcePrescription from "../components/SourcePrescription";
import ExercisePictures from "../components/ExercisePictures";
import { exerciseThumbnail } from "../lib/exercise-media";
import { sourceExercises } from "../lib/programs";
const AssetViewer = lazy(() => import("../three/AssetViewer"));
export function Library() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(""),
    [muscle, setMuscle] = useState("All");
  const selected = params.get("exercise")
    ? findExercise(params.get("exercise")!)
    : undefined;
  const { repo, local } = useStore();
  const { profile } = useProfile();
  const assets = useQuery({
    queryKey: ["assets", local],
    queryFn: () => repo.assets(),
  });
  const animation = assets.data?.animations.find(
    (a) => a.exercise_id === selected?.id && a.reviewed_by && a.reviewed_at,
  );
  const model = assets.data?.models.find((m) => m.id === animation?.model_id);
  return (
    <>
      <PageHead
        title="Move with understanding."
        description="Find the movement. Learn the cues. Make each rep intentional."
      />
      {selected ? (
        <section className="panel exercise-detail">
          <Button variant="ghost" onClick={() => setParams({})}>
            ← All exercises
          </Button>
          <div className="exercise-detail-head">
            <div>
              <span className="tag">
                {selected.muscle} · {selected.difficulty}
              </span>
              <h2>{selected.name}</h2>
              <p>
                {selected.equipment} · Secondary:{" "}
                {selected.secondary.join(", ") || "None listed"}
              </p>
            </div>
            <Button asChild>
              <Link to="/app/builder">
                Add to a workout <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <ExercisePictures key={selected.id} exerciseId={selected.id} />
          {model && animation && profile?.quality !== "static" ? (
            <Suspense fallback={<p>Loading reviewed demonstration…</p>}>
              <AssetViewer
                asset={model}
                animation={animation}
                region={selected.muscle}
                onSelect={() => {}}
              />
            </Suspense>
          ) : null}
          {selected.prescription ? (
            <SourcePrescription
              source={selected.prescription}
              showPictures={false}
            />
          ) : (
            <>
              {" "}
              <div className="instruction-grid">
                <div>
                  <h3>Movement checkpoints</h3>
                  <ol>
                    {selected.instructions.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>Keep in mind</h3>
                  <p>{selected.mistakes}</p>
                  <h3>Starting guidance</h3>
                  <p>
                    {selected.sets} sets · {selected.reps}{" "}
                    {selected.id === "plank" ? "seconds" : "reps"} ·{" "}
                    {selected.rest} sec rest. Choose a load that leaves
                    comfortable repetitions in reserve.
                  </p>
                  <h3>Alternative to explore</h3>
                  <p>
                    {selected.alternative}. Substitutions may train different
                    muscles; assess suitability.
                  </p>
                </div>
              </div>
            </>
          )}
          <Notice>
            General education, not individualized technique clearance. Stop if a
            movement causes pain; ask a qualified coach when unsure.
          </Notice>
        </section>
      ) : (
        <>
          <div className="library-toolbar">
            <Field label="Search movements">
              <div className="search-field">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exercise or equipment…"
                />
              </div>
            </Field>
            <Field label="Muscle group">
              <select
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
              >
                <option>All</option>
                {muscleGroups.map((m) => (
                  <option key={m.name}>{m.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="exercise-library">
            {[...exercises, ...sourceExercises]
              .filter(
                (e) =>
                  (muscle === "All" || e.muscle === muscle) &&
                  (
                    e.name +
                    " " +
                    e.equipment +
                    " " +
                    (e.prescription?.programTitle ?? "")
                  )
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((e) => (
                <Link
                  key={e.id}
                  to={"?exercise=" + e.id}
                  className="library-row"
                >
                  <MovementThumbnail id={e.id} />
                  <div>
                    <h2>{e.name}</h2>
                    <p>
                      {e.muscle} ·{" "}
                      {e.prescription
                        ? `${e.prescription.programTitle} · ${e.prescription.phaseTitle}`
                        : e.equipment}
                    </p>
                  </div>
                  <span className="tag">{e.difficulty}</span>
                  <ArrowRight size={18} />
                </Link>
              ))}
          </div>
          <p className="fine-print">
            Picture references are available for all imported program blocks.
            Wall push-up and prone W raise currently have written guidance only.
            Reviewed 3D assets will appear as they are approved; no generated
            motion is presented as exercise instruction.
          </p>
        </>
      )}
    </>
  );
}
function MovementThumbnail({ id }: { id: string }) {
  const picture = exerciseThumbnail(id);
  const [failed, setFailed] = useState(false);
  return (
    <div className="movement-thumbnail">
      {picture && !failed ? (
        <img
          src={picture.src}
          alt=""
          width={picture.width}
          height={picture.height}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>
          Written
          <br />
          guide
        </span>
      )}
    </div>
  );
}
export function Muscles() {
  const [search, setSearch] = useState(""),
    [selected, setSelected] = useState("Chest");
  const { repo, local } = useStore();
  const { profile } = useProfile();
  const assets = useQuery({
    queryKey: ["assets", local],
    queryFn: () => repo.assets(),
  });
  const model = assets.data?.models.find(
    (m) => Object.keys(m.region_map).length >= 11,
  );
  return (
    <>
      <PageHead
        title="Know what you’re training."
        description="Explore muscle function and find movements for your next session."
      />
      <div
        className={`muscle-layout ${model && profile?.quality !== "static" ? "" : "muscle-directory"}`}
      >
        {model && profile?.quality !== "static" && (
          <section className="panel muscle-stage">
            <Suspense fallback={<p>Loading anatomy…</p>}>
              <AssetViewer
                asset={model}
                region={selected}
                onSelect={setSelected}
              />
            </Suspense>
          </section>
        )}
        <section className="panel">
          <Field label="Search muscle groups">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. quadriceps"
            />
          </Field>
          <div className="muscle-buttons">
            {muscleGroups
              .filter((m) =>
                m.name.toLowerCase().includes(search.toLowerCase()),
              )
              .map((m) => (
                <button
                  key={m.name}
                  aria-pressed={selected === m.name}
                  onClick={() => setSelected(m.name)}
                >
                  {m.name}
                </button>
              ))}
          </div>
          <div className="muscle-info">
            <h2>{selected}</h2>
            <p>{muscleGroups.find((m) => m.name === selected)?.function}</p>
            <h3>Movements to explore</h3>
            {exercises
              .filter(
                (e) => e.muscle === selected || e.secondary.includes(selected),
              )
              .map((e) => (
                <Link key={e.id} to={"/app/library?exercise=" + e.id}>
                  {e.name}
                  <small>
                    {e.equipment} · {e.difficulty}
                  </small>
                  <ArrowRight size={16} />
                </Link>
              ))}
          </div>
          <Button asChild variant="outline">
            <Link to="/app/builder">
              Build a workout
              <ArrowRight size={16} />
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
