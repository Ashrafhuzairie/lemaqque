import { describe, it, expect } from "vitest";
import {
  allSourceWorkouts,
  programDefinitions,
  createSourceTemplates,
  calculateShredMacros,
  sourceMacroCalories,
  KG_TO_LB,
  workoutPrescription,
  sourceTemplateId,
} from "../src/lib/programs";
import { templateSchema } from "../src/lib/validation";
import { volume } from "../src/lib/fitness";
import type { SetLog } from "../src/lib/types";
const byId = (id: string) =>
  allSourceWorkouts.find((x) => x.workout.id === id)!;
describe("faithful source program representation", () => {
  it("contains all three books, twenty distinct templates and 105 distinct blocks", () => {
    expect(
      programDefinitions.map((p) =>
        p.phases.map((phase) => phase.workouts.length),
      ),
    ).toEqual([[5], [1, 1, 1], [6, 6]]);
    expect(allSourceWorkouts).toHaveLength(20);
    const ids = allSourceWorkouts.flatMap((w) =>
      w.workout.exercises.map((e) => e.id),
    );
    expect(new Set(ids).size).toBe(105);
  });
  it("keeps exact bulk bench sets, warm-ups, tempo, ladder rounds and FST-7", () => {
    const { workout } = byId("bulk-chest");
    expect(workout.exercises.map((e) => e.sets.length)).toEqual([
      6, 5, 4, 4, 7,
    ]);
    expect(workout.exercises[0].sets.map((s) => s.segments[0].reps)).toEqual([
      15, 10, 6, 5, 3, 10,
    ]);
    expect(workout.exercises[0].sets.filter((s) => s.warmup)).toHaveLength(2);
    expect(workout.exercises[0].notes.join(" ")).toContain("3-second negative");
    expect(workout.exercises[2].sets[0].segments).toHaveLength(9);
    expect(workout.exercises[4].restMin).toBe(20);
    expect(workout.exercises[4].restMax).toBe(20);
  });
  it("keeps illustrative pounds, ranged reps and missing rest without substituting defaults", () => {
    const { workout } = byId("legendary-chest-weeks-1-4");
    expect(workout.exercises[0].sets).toHaveLength(8);
    expect(workout.exercises[0].sets[5].text).toBe("365 lbs — 2 reps");
    expect(workout.exercises[0].sets[6].text).toContain("8–10 reps");
    expect(workout.exercises[3].restMin).toBeNull();
    expect(
      workout.exercises[4].sets.every((s) => s.text === "Rep to failure"),
    ).toBe(true);
  });
  it("retains source ambiguities rather than inventing barbell or cable-press doses", () => {
    expect(
      byId("legendary-chest-weeks-9-12").workout.exercises[2].notes.join(" "),
    ).toContain("no barbell load, reps or sets");
    expect(
      byId("shred-phase-2-chest").workout.exercises[2].notes.join(" "),
    ).toContain("No additional cable press reps");
  });
  it("preserves both phase-one back-extension blocks and phase-specific ab volume", () => {
    expect(
      byId("shred-phase-1-back").workout.exercises.filter((e) =>
        e.name.startsWith("Back extensions"),
      ),
    ).toHaveLength(2);
    expect(
      byId("shred-phase-1-abs").workout.exercises.map((e) => e.sets.length),
    ).toEqual([5, 5, 5]);
    expect(
      byId("shred-phase-2-abs").workout.exercises.map((e) => e.sets.length),
    ).toEqual([4, 4, 4, 4]);
  });
  it("keeps composite set components separate and excludes timed flexes from external-load volume", () => {
    const log = {
      completed: true,
      reps: 0,
      weight: 0,
      segments: [
        { label: "Fly", reps: 12, weight: 10, unit: "reps", multiplier: 1 },
        {
          label: "Flex",
          reps: 10,
          weight: 999,
          unit: "seconds",
          multiplier: 1,
        },
        {
          label: "Unilateral row",
          reps: 10,
          weight: 20,
          unit: "reps",
          multiplier: 2,
        },
      ],
    } as SetLog;
    expect(volume([log])).toBe(520);
  });
  it("imports deterministically and preserves every per-set source object", async () => {
    const user = "11111111-1111-4111-8111-111111111111";
    const templates = await createSourceTemplates(user, allSourceWorkouts);
    expect(templates).toHaveLength(20);
    for (let i = 0; i < templates.length; i++) {
      expect(templateSchema.safeParse(templates[i]).success).toBe(true);
      expect(templates[i].exercises.map((e) => e.source?.rows)).toEqual(
        allSourceWorkouts[i].workout.exercises.map((e) => e.sets),
      );
    }
    expect(await sourceTemplateId(user, "bulk-chest")).toBe(
      await sourceTemplateId(user, "bulk-chest"),
    );
    expect(await sourceTemplateId(user, "bulk-chest")).not.toBe(
      await sourceTemplateId(
        "22222222-2222-4222-8222-222222222222",
        "bulk-chest",
      ),
    );
  });
});
describe("exact supplied nutrition arithmetic", () => {
  it("uses the printed coefficients without rounding fats to match a printed example", () => {
    expect(calculateShredMacros(125, "lb", "base")).toEqual({
      weightLb: 125,
      protein: 175,
      carbs: 175,
      fat: 31.25,
      calories: 1681.25,
    });
    const source = programDefinitions.find((p) => p.id === "shred")!;
    expect(source.nutrition.examples[0].fat).toBe(32);
  });
  it("converts kg to lb once before applying coefficients", () => {
    const result = calculateShredMacros(70, "kg", "base");
    expect(result.weightLb).toBeCloseTo(70 * KG_TO_LB, 10);
    expect(result.protein).toBeCloseTo(70 * KG_TO_LB * 1.4, 10);
    expect(result.calories).toBeCloseTo(
      result.protein * 4 + result.carbs * 4 + result.fat * 9,
      10,
    );
  });
  it("subtracts chosen 25–50g carbohydrate and doubles adjusted carbohydrate only for re-feed", () => {
    expect(calculateShredMacros(150, "lb", "adjusted", 25)).toMatchObject({
      protein: 210,
      carbs: 185,
      fat: 37.5,
      calories: 1917.5,
    });
    expect(calculateShredMacros(150, "lb", "refeed", 25)).toMatchObject({
      protein: 210,
      carbs: 370,
      fat: 37.5,
      calories: 2657.5,
    });
    expect(() => calculateShredMacros(150, "lb", "adjusted", 75)).toThrow();
    expect(() => calculateShredMacros(NaN, "kg", "base")).toThrow();
  });
  it("preserves all thirty source days and their inconsistencies without inserting user measurements", () => {
    const monthly = programDefinitions.find((p) => p.id === "shred")!.nutrition
      .monthlyExample!;
    expect(monthly.days).toHaveLength(30);
    expect(monthly.baseline).toEqual({ protein: 220, carbs: 240, fat: 38 });
    expect(monthly.days[26].carbs).toBe(155);
    expect(monthly.days[27].carbs).toBe(180);
    expect(monthly.days[15]).toMatchObject({
      protein: 220,
      carbs: 400,
      fat: 60,
      mode: "Re-feed",
    });
    expect(sourceMacroCalories(monthly.days[15])).toBe(3020);
  });
  it("does not invent formulas for bulk or chest or meal nutrient totals", () => {
    expect(programDefinitions[0].nutrition.formula).toBeUndefined();
    expect(programDefinitions[1].nutrition.formula).toBeUndefined();
    for (const p of programDefinitions)
      for (const meal of p.nutrition.meals)
        expect(meal).not.toHaveProperty("calories");
  });
});
