import { useState } from "react";
import { Plus, Trash2, Droplets, SlidersHorizontal } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  DataGate,
  Empty,
  Field,
  Notice,
  PageHead,
  round,
} from "../components/common";
import {
  useRows,
  useSave,
  useRemove,
  useStore,
  useProfile,
  identity,
} from "../lib/store";
import { localDay, nutritionTotals } from "../lib/fitness";
import { mealSchema, targetSchema } from "../lib/validation";
import { foodSuggestions } from "../lib/catalog";
import type { Targets } from "../lib/types";
export default function Nutrition() {
  const meals = useRows("meal_entries"),
    targets = useRows("nutrition_targets"),
    waters = useRows("water_entries");
  const save = useSave("meal_entries"),
    saveWater = useSave("water_entries");
  const remove = useRemove("meal_entries");
  const { profile } = useProfile();
  const { userId } = useStore();
  const [day, setDay] = useState(() => localDay(new Date(), profile?.timezone));
  const [show, setShow] = useState(false),
    [showTargets, setShowTargets] = useState(false),
    [error, setError] = useState("");
  const todayMeals = meals.data?.filter((m) => m.day === day) || [];
  const total = nutritionTotals(todayMeals);
  const target = targets.data?.[0];
  const water =
    waters.data?.filter((w) => w.day === day).reduce((n, w) => n + w.ml, 0) ||
    0;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    try {
      const values = mealSchema.parse({
        ...Object.fromEntries(new FormData(form)),
        day,
      });
      await save.mutateAsync({ ...identity(userId!), ...values });
      setShow(false);
      form.reset();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <PageHead
        title="Fuel the work."
        description="A little more awareness. A more sustainable routine."
      >
        <div className="actions">
          <Button
            variant="outline"
            onClick={() => setShowTargets(!showTargets)}
          >
            <SlidersHorizontal size={16} />
            Targets
          </Button>
          <Button onClick={() => setShow(!show)}>
            <Plus size={17} />
            {show ? "Close meal entry" : "Log a meal"}
          </Button>
        </div>
      </PageHead>
      <DataGate queries={[meals, targets, waters]}>
        <div className="date-toolbar">
          <label htmlFor="nutrition-date">Food diary</label>
          <input
            id="nutrition-date"
            aria-label="Food diary date"
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
          <span>Values from your logged entries</span>
        </div>
        {error && <Notice error>{error}</Notice>}
        {showTargets && (
          <TargetForm target={target} onClose={() => setShowTargets(false)} />
        )}
        <div className="nutrition-top">
          <section className="panel calorie-panel">
            <div>
              <h2>Daily energy</h2>
              <span>
                {day === localDay(new Date(), profile?.timezone)
                  ? "Today"
                  : day}
              </span>
            </div>
            <div className="calorie-value">
              {round(total.calories)}
              <span>kcal</span>
            </div>
            <p>
              {target
                ? `of ${round(target.calories)} kcal personal target`
                : "Set a personal calorie target when you’re ready."}
            </p>
            <div className="progress-track">
              <span
                style={{
                  width: `${target ? Math.min((total.calories / target.calories) * 100, 100) : 0}%`,
                }}
              />
            </div>
            <small>
              {target
                ? `${round(Math.max(0, target.calories - total.calories))} kcal to your selected target`
                : "Targets are optional and can be adjusted."}
            </small>
          </section>
          <section className="panel macro-panel">
            <h2>The building blocks</h2>
            {(["protein", "carbs", "fat"] as const).map((macro, i) => (
              <div className="macro-row" key={macro}>
                <div>
                  <span className={"macro-dot macro-" + i} />
                  <span>
                    {macro === "carbs"
                      ? "Carbohydrates"
                      : macro[0].toUpperCase() + macro.slice(1)}
                  </span>
                  <strong>
                    {round(total[macro])}
                    <small> g{target ? ` / ${target[macro]}` : ""}</small>
                  </strong>
                </div>
                <div className="progress-track">
                  <span
                    className={"macro-" + i}
                    style={{
                      width: `${target ? Math.min((total[macro] / target[macro]) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </section>
        </div>
        {show && (
          <form className="panel meal-form" onSubmit={submit}>
            <h2>What’s on your plate?</h2>
            <p>
              Enter values per serving from packaging or a documented food
              database. We won’t guess the nutrients.
            </p>
            <div className="form-grid">
              <Field label="Food name">
                <input
                  name="name"
                  list="food-names"
                  required
                  placeholder="Search a name or add your own"
                />
                <datalist id="food-names">
                  {foodSuggestions.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </Field>
              <Field label="Meal">
                <select name="meal">
                  {["Breakfast", "Lunch", "Dinner", "Snack"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Number of servings">
                <input
                  name="quantity"
                  type="number"
                  min={0.01}
                  max={100}
                  step={0.01}
                  defaultValue={1}
                  required
                />
              </Field>
              <Field label="Serving description">
                <input
                  name="unit"
                  placeholder="e.g. 100 g, one packet"
                  required
                />
              </Field>
              <Field label="Calories · kcal per serving">
                <input
                  name="calories"
                  type="number"
                  min={0}
                  max={5000}
                  step={0.1}
                  required
                />
              </Field>
              <Field label="Protein · g per serving">
                <input
                  name="protein"
                  type="number"
                  min={0}
                  max={500}
                  step={0.1}
                  required
                />
              </Field>
              <Field label="Carbohydrates · g per serving">
                <input
                  name="carbs"
                  type="number"
                  min={0}
                  max={1000}
                  step={0.1}
                  required
                />
              </Field>
              <Field label="Fat · g per serving">
                <input
                  name="fat"
                  type="number"
                  min={0}
                  max={500}
                  step={0.1}
                  required
                />
              </Field>
            </div>
            <Field
              label="Nutrition source"
              hint="Malaysian dishes vary by preparation. Use a documented source for the actual portion."
            >
              <input
                name="source"
                required
                minLength={3}
                placeholder="e.g. Brand packaging, MyFCD entry + serving size"
              />
            </Field>
            <div className="actions">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save meal entry"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShow(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
        <section className="panel food-diary">
          <h2>Your food diary</h2>
          {todayMeals.length === 0 ? (
            <Empty title="A fresh page for today.">
              Log your first meal to see your calories and macros here.
            </Empty>
          ) : (
            ["Breakfast", "Lunch", "Dinner", "Snack"].map((meal) => {
              const entries = todayMeals.filter((m) => m.meal === meal);
              return (
                entries.length > 0 && (
                  <div key={meal} className="meal-group">
                    <h3>{meal}</h3>
                    {entries.map((m) => (
                      <div className="meal-entry" key={m.id}>
                        <div>
                          <strong>{m.name}</strong>
                          <small>
                            {m.quantity} × {m.unit} · {m.source}
                          </small>
                          <small>
                            P {round(m.protein * m.quantity)} g · C{" "}
                            {round(m.carbs * m.quantity)} g · F{" "}
                            {round(m.fat * m.quantity)} g
                          </small>
                        </div>
                        <strong>
                          {round(m.calories * m.quantity)} <small>kcal</small>
                        </strong>
                        <button
                          aria-label={"Copy " + m.name + " to today"}
                          onClick={() =>
                            save.mutate(
                              {
                                ...m,
                                ...identity(userId!),
                                day: localDay(new Date(), profile?.timezone),
                              },
                              { onError: (e) => setError(e.message) },
                            )
                          }
                        >
                          Copy to today
                        </button>
                        <button
                          aria-label={"Delete " + m.name}
                          disabled={remove.isPending}
                          onClick={() =>
                            remove.mutate(m.id, {
                              onError: (e) => setError(e.message),
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              );
            })
          )}
        </section>
        <section className="panel water-panel">
          <Droplets size={28} />
          <div>
            <h2>Keep it flowing.</h2>
            <p>
              {round(water)} ml logged
              {target ? ` · ${target.water_ml} ml personal target` : ""}
            </p>
          </div>
          <div className="actions">
            {[250, 500].map((ml) => (
              <Button
                key={ml}
                variant="outline"
                disabled={saveWater.isPending}
                onClick={() =>
                  saveWater.mutate(
                    { ...identity(userId!), day, ml },
                    { onError: (e) => setError(e.message) },
                  )
                }
              >
                + {ml} ml
              </Button>
            ))}
          </div>
        </section>
        <p className="fine-print">
          Tracking supports awareness; it is not a prescribed diet. Calorie
          needs vary. For individualized targets, consult a qualified dietitian.
        </p>
      </DataGate>
    </>
  );
}
function TargetForm({
  target,
  onClose,
}: {
  target?: Targets;
  onClose: () => void;
}) {
  const { userId } = useStore();
  const save = useSave("nutrition_targets");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const values = targetSchema.parse(
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      await save.mutateAsync({
        ...values,
        id: target?.id || userId!,
        user_id: userId!,
      });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <form className="panel" onSubmit={submit}>
      <h2>Your daily targets</h2>
      <p>
        Choose your own goals. This app does not prescribe a calorie deficit.
      </p>
      <div className="form-grid">
        {(["calories", "protein", "carbs", "fat", "water_ml"] as const).map(
          (k) => (
            <Field
              key={k}
              label={
                {
                  calories: "Calories · kcal",
                  protein: "Protein · g",
                  carbs: "Carbohydrates · g",
                  fat: "Fat · g",
                  water_ml: "Water · ml",
                }[k]
              }
            >
              <input
                type="number"
                name={k}
                defaultValue={target?.[k]}
                required
                min={k === "calories" ? 1200 : k === "water_ml" ? 500 : 20}
              />
            </Field>
          ),
        )}
      </div>
      {error && <Notice error>{error}</Notice>}
      <div className="actions">
        <Button disabled={save.isPending}>Save targets</Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
