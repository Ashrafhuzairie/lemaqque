import { useEffect, useState } from "react";
import { Calculator, Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Field, Notice } from "./common";
import {
  calculateShredMacros,
  sourceMacroCalories,
  type ProgramDefinition,
  type SourceMacros,
} from "../lib/programs";
import { useStore, useRows, useSave, useProfile } from "../lib/store";
import { targetSchema } from "../lib/validation";
const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
export function MacroReadout({ value }: { value: SourceMacros }) {
  return (
    <div className="source-macros">
      <div>
        <strong>{fmt(sourceMacroCalories(value))}</strong>
        <span>kcal · 4P + 4C + 9F</span>
      </div>
      <div>
        <strong>
          {fmt(value.protein)}
          <small> g</small>
        </strong>
        <span>Protein</span>
      </div>
      <div>
        <strong>
          {fmt(value.carbs)}
          <small> g</small>
        </strong>
        <span>Carbohydrate</span>
      </div>
      <div>
        <strong>
          {fmt(value.fat)}
          <small> g</small>
        </strong>
        <span>Fat</span>
      </div>
    </div>
  );
}
export default function ProgramNutrition({
  program,
  readOnly = false,
}: {
  program: ProgramDefinition;
  readOnly?: boolean;
}) {
  const { userId } = useStore();
  const targets = useRows("nutrition_targets");
  const save = useSave("nutrition_targets");
  const { profile } = useProfile();
  const [waterTarget, setWaterTarget] = useState("");
  useEffect(() => {
    if (targets.data?.[0]) setWaterTarget(String(targets.data[0].water_ml));
  }, [targets.data]);
  const [weight, setWeight] = useState("150"),
    [unit, setUnit] = useState<"lb" | "kg">("lb"),
    [mode, setMode] = useState<"base" | "adjusted" | "refeed">("base"),
    [reduction, setReduction] = useState(25);
  const [error, setError] = useState(""),
    [message, setMessage] = useState("");
  useEffect(() => {
    if (profile) {
      setWeight(String(profile.weight));
      setUnit("kg");
    }
  }, [profile]);
  let result: ReturnType<typeof calculateShredMacros> | null = null;
  let calcError = "";
  if (program.nutrition.formula) {
    try {
      result = calculateShredMacros(Number(weight), unit, mode, reduction);
    } catch (e) {
      calcError = (e as Error).message;
    }
  }
  async function apply(
    value: SourceMacros,
    source: {
      mode: string;
      weightLb?: number;
      carbReduction?: number;
      exampleDay?: number;
      pages: number[];
    },
  ) {
    setError("");
    setMessage("");
    try {
      const valid = targetSchema.parse({
        ...value,
        calories: sourceMacroCalories(value),
        water_ml: Number(waterTarget),
      });
      await save.mutateAsync({
        ...valid,
        id: userId!,
        user_id: userId!,
        source: {
          programId: program.id,
          fileName: program.fileName,
          ...source,
        },
      });
      setMessage(
        "Selected source calculation saved as your nutrition targets. No meals or body weights were added.",
      );
    } catch (e) {
      setError("Targets were not changed. " + (e as Error).message);
    }
  }
  return (
    <div className="program-nutrition">
      {!readOnly &&
        userId &&
        (program.nutrition.formula || program.nutrition.monthlyExample) && (
          <Field
            label="Water target · ml (separate from PDF macros)"
            hint="Your existing target is retained. If you have not set one, enter your own hydration target before applying macro targets; no water value is invented from the book."
          >
            <input
              type="number"
              min={500}
              max={6000}
              step={50}
              value={waterTarget}
              onChange={(e) => setWaterTarget(e.target.value)}
            />
          </Field>
        )}
      {program.nutrition.formula && (
        <section className="panel source-calculator">
          <header>
            <Calculator size={25} />
            <div>
              <h2>The source formula. Your numbers.</h2>
              <p>{program.fileName} · PDF pp. 4, 8, 10 · No hidden rounding</p>
            </div>
          </header>
          <div className="calculator-inputs">
            <Field label="Body weight">
              <input
                type="number"
                min={1}
                max={1000}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Field>
            <Field label="Weight unit">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "lb" | "kg")}
              >
                <option value="lb">Pounds · lb</option>
                <option value="kg">Kilograms · kg</option>
              </select>
            </Field>
            <Field label="Source diet stage">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                <option value="base">Initial base equation</option>
                <option value="adjusted">Adjusted · subtract carbs</option>
                <option value="refeed">Re-feed · double adjusted carbs</option>
              </select>
            </Field>
            {mode !== "base" && (
              <Field label="Carbohydrate reduction · g">
                <input
                  type="number"
                  min={25}
                  max={50}
                  step={1}
                  value={reduction}
                  onChange={(e) => setReduction(Number(e.target.value))}
                />
              </Field>
            )}
          </div>
          <div className="formula-lines">
            <code>Protein = lb × 1.4</code>
            <code>
              Carbohydrate = lb × 1.4
              {mode !== "base" ? ` − ${reduction} g` : ""}
              {mode === "refeed" ? " → × 2" : ""}
            </code>
            <code>Fat = lb × 0.25</code>
          </div>
          {result ? (
            <>
              <MacroReadout value={result} />
              <p className="calculation-detail">
                Calculated from {fmt(result.weightLb)} lb
                {unit === "kg" ? " (1 kg = 2.2046226218487757 lb)" : ""}.
                Displayed values use up to two decimals; calculations and saved
                values retain precision. Re-feed doubles adjusted carbohydrate
                only; the book’s separate example menus can change fat and
                foods.
              </p>
              {!readOnly && userId && (
                <Button
                  disabled={
                    save.isPending || targets.isPending || !!targets.error
                  }
                  onClick={() =>
                    result &&
                    apply(result, {
                      mode,
                      weightLb: result.weightLb,
                      carbReduction: mode === "base" ? 0 : reduction,
                      pages: [4, 8, 10],
                    })
                  }
                >
                  {save.isPending
                    ? "Saving targets…"
                    : "Apply this calculation"}
                  <Check size={16} />
                </Button>
              )}
            </>
          ) : (
            <Notice error>{calcError}</Notice>
          )}
          <Notice>
            These are the uploaded author’s bodybuilding calculations, not a
            personal nutrition prescription. Nothing is applied automatically.
            The app’s supported target limits still apply; the displayed source
            calculation is not silently altered.
          </Notice>
        </section>
      )}
      {error && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      {program.nutrition.sections.map((section) => (
        <details key={section.title} className="source-section">
          <summary>
            <span>
              {section.title}
              <small>
                {program.fileName} · PDF pp. {section.pages.join(", ")}
              </small>
            </span>
            <ArrowRight size={16} />
          </summary>
          <ul>
            {section.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>
      ))}
      {program.nutrition.examples.length > 0 && (
        <section className="panel">
          <h2>Printed base-diet examples</h2>
          <p>
            Kept separately from the precise equation. The fat amounts below are
            the source’s rounded examples.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Body weight · lb</th>
                  <th>Protein · g</th>
                  <th>Carbs · g</th>
                  <th>Fat · g</th>
                </tr>
              </thead>
              <tbody>
                {program.nutrition.examples.map((v) => (
                  <tr key={v.weightLb}>
                    <td>{v.weightLb}</td>
                    <td>{v.protein}</td>
                    <td>{v.carbs}</td>
                    <td>{v.fat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {program.nutrition.monthlyExample && (
        <details className="source-section">
          <summary>
            <span>
              The exact 30-day example
              <small>
                PDF pp. 14–15 · example data, not your weight history
              </small>
            </span>
            <ArrowRight size={16} />
          </summary>
          <p>
            Starting weight 160 lb. Baseline: 220 g protein / 240 g carbs / 38 g
            fat. Day 27’s 155 g carbohydrate and day 28’s return to 180 g are
            preserved as printed.
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Example weight · lb</th>
                  <th>Stage</th>
                  <th>P · g</th>
                  <th>C · g</th>
                  <th>F · g</th>
                  <th>Calculated kcal</th>
                  {!readOnly && userId && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {program.nutrition.monthlyExample.days.map((day) => (
                  <tr key={day.day}>
                    <td>{day.day}</td>
                    <td>{day.weightLb}</td>
                    <td>{day.mode}</td>
                    <td>{day.protein}</td>
                    <td>{day.carbs}</td>
                    <td>{day.fat}</td>
                    <td>{sourceMacroCalories(day)}</td>
                    {!readOnly && userId && (
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={save.isPending}
                          onClick={() =>
                            apply(day, {
                              mode: "source-example",
                              exampleDay: day.day,
                              pages: [14, 15],
                            })
                          }
                        >
                          Use day {day.day} targets
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
      {program.nutrition.meals.length > 0 && (
        <section className="source-meals">
          <h2>Meal portions, as supplied.</h2>
          <p>
            Portions stay in their original units. The PDFs do not supply
            complete nutrient totals for these recipes, so none are invented or
            automatically logged.
          </p>
          {program.nutrition.meals.map((meal) => (
            <details key={meal.name} className="source-section">
              <summary>
                <span>
                  {meal.name}
                  <small>
                    {program.fileName} · PDF p. {meal.page}
                  </small>
                </span>
                <ArrowRight size={16} />
              </summary>
              <ul>
                {meal.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {meal.notes && <p>{meal.notes}</p>}
            </details>
          ))}
        </section>
      )}
    </div>
  );
}
