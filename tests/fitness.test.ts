import { describe, it, expect } from "vitest";
import {
  attendanceRate,
  elapsed,
  generateTemplates,
  localDay,
  nutritionTotals,
  progression,
  volume,
} from "../src/lib/fitness";
import {
  mealSchema,
  setSchema,
  templateSchema,
  profileSchema,
} from "../src/lib/validation";
import { exercises } from "../src/lib/catalog";
import type { Meal, SetLog, Attendance } from "../src/lib/types";
const set = (extra: Partial<SetLog> = {}): SetLog => ({
  id: "1",
  user_id: "u",
  session_id: "s",
  exercise_id: "curl",
  set_number: 1,
  reps: 10,
  weight: 15,
  rpe: 7,
  completed: true,
  ...extra,
});
describe("tracking calculations", () => {
  it("multiplies nutrients by servings without rounding intermediates", () => {
    expect(
      nutritionTotals([
        { quantity: 1.5, calories: 120, protein: 8, carbs: 14, fat: 3 } as Meal,
        { quantity: 0.25, calories: 80, protein: 4, carbs: 8, fat: 2 } as Meal,
      ]),
    ).toEqual({ calories: 200, protein: 13, carbs: 23, fat: 5 });
  });
  it("counts only completed sets toward volume", () =>
    expect(
      volume([
        set(),
        set({ weight: 20, reps: 8 }),
        set({ completed: false, weight: 100 }),
      ]),
    ).toBe(310));
  it("excludes rest and future dates from attendance denominator", () => {
    expect(
      attendanceRate(
        [
          { day: "2026-11-01", status: "planned" },
          { day: "2026-11-02", status: "rest" },
          { day: "2026-11-03", status: "planned" },
          { day: "2026-11-05", status: "planned" },
        ],
        [{ day: "2026-11-01", status: "completed" } as Attendance],
        "2026-11-03",
      ),
    ).toBe(50);
    expect(attendanceRate([], [], "2026-11-01")).toBeNull();
  });
  it("keeps partial days distinct from completed attendance", () =>
    expect(
      attendanceRate(
        [{ day: "2026-11-01", status: "partial" }],
        [],
        "2026-11-01",
      ),
    ).toBe(0));
  it("uses the user timezone across UTC midnight", () => {
    expect(
      localDay(new Date("2026-10-31T17:00:00Z"), "Asia/Kuala_Lumpur"),
    ).toBe("2026-11-01");
    expect(localDay(new Date("2026-11-01T01:00:00Z"), "America/New_York")).toBe(
      "2026-10-31",
    );
  });
  it("freezes elapsed time during pause and subtracts earlier pauses", () => {
    const s = {
      started_at: "2026-11-01T00:00:00Z",
      finished_at: null,
      paused_at: "2026-11-01T00:10:00Z",
      paused_ms: 120000,
    };
    expect(elapsed(s, Date.parse("2026-11-01T00:30:00Z"))).toBe(480);
  });
  it("does not suggest loading up on incomplete or high effort sets", () => {
    expect(progression([set(), set(), set({ rpe: 9 })], 10)).toMatch(
      /Keep the load/,
    );
    expect(progression([set(), set(), set()], 10)).toMatch(
      /smallest available/,
    );
    expect(progression([set()], 10)).toMatch(/Keep the load/);
  });
});
describe("program generation and input limits", () => {
  it.each(["Bodyweight", "Dumbbells", "Gym"] as const)(
    "respects %s equipment with beginner volume",
    (equipment) => {
      const plans = generateTemplates(
        { days: [1, 3, 5], equipment, experience: "Beginner", duration: 30 },
        "user",
      );
      expect(plans.length).toBeGreaterThan(0);
      for (const p of plans) {
        expect(p.exercises.length).toBeGreaterThan(0);
        expect(p.exercises.length).toBeLessThanOrEqual(3);
        for (const item of p.exercises) {
          expect(item.sets).toBe(2);
          const e = exercises.find((e) => e.id === item.exercise_id)!;
          expect(
            equipment === "Gym" ||
              [equipment, "Bodyweight"].includes(e.equipment),
          ).toBe(true);
        }
      }
    },
  );
  it.each(["Bodyweight", "Dumbbells", "Gym"] as const)(
    "generates no empty sessions for five-day %s plans",
    (equipment) => {
      const plans = generateTemplates(
        {
          days: [1, 2, 3, 4, 5],
          equipment,
          experience: "Beginner",
          duration: 45,
        },
        "user",
      );
      expect(plans).toHaveLength(3);
      for (const plan of plans)
        expect(templateSchema.safeParse(plan).success).toBe(true);
    },
  );
  it("rejects unsafe or invalid logs and meals", () => {
    expect(setSchema.safeParse({ reps: -1, weight: 10, rpe: 7 }).success).toBe(
      false,
    );
    expect(setSchema.safeParse({ reps: 10, weight: NaN, rpe: 7 }).success).toBe(
      false,
    );
    expect(setSchema.safeParse({ reps: 10, weight: 10, rpe: 11 }).success).toBe(
      false,
    );
    expect(
      mealSchema.safeParse({
        name: "Nasi",
        quantity: 1,
        unit: "plate",
        meal: "Lunch",
        day: "2026-11-01",
        calories: -100,
        protein: 1,
        carbs: 1,
        fat: 1,
        source: "",
      }).success,
    ).toBe(false);
  });
  it("requires a nonempty bounded template", () =>
    expect(
      templateSchema.safeParse({ name: "", split: "Full Body", exercises: [] })
        .success,
    ).toBe(false));
  it("rejects unknown timezone and duplicate preferred days", () => {
    const profile = {
      name: "Athlete",
      age: 25,
      height: 170,
      weight: 70,
      target_weight: 70,
      goal: "General fitness",
      experience: "Beginner",
      days: [1, 1],
      duration: 45,
      equipment: "Gym",
      restrictions: "",
      timezone: "Nowhere/Fake",
      quality: "auto",
    };
    expect(profileSchema.safeParse(profile).success).toBe(false);
  });
});
