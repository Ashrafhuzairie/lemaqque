import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { exercises } from "../src/lib/catalog";
import { sourceExercises } from "../src/lib/programs";
import { exerciseMedia, sourcePictureId } from "../src/lib/exercise-media";

describe("exercise picture coverage and provenance", () => {
  it("covers all 105 imported blocks and resolves persisted source prescriptions", () => {
    expect(sourceExercises).toHaveLength(105);
    for (const exercise of sourceExercises) {
      expect(
        exerciseMedia.exercises[exercise.id]?.length,
        exercise.name,
      ).toBeGreaterThan(0);
      expect(sourcePictureId(exercise.prescription!)).toBe(exercise.id);
    }
    for (const exercise of exercises) {
      expect(
        Boolean(
          exerciseMedia.exercises[exercise.id]?.length ||
          exerciseMedia.missing[exercise.id],
        ),
        exercise.name,
      ).toBe(true);
    }
  });
  it("shows each component of representative supersets, tri-sets and cable ladders", () => {
    for (const [id, count] of [
      ["source-bulk-legs-1", 3],
      ["source-bulk-arms-2", 2],
      ["source-bulk-chest-3", 3],
      ["source-shred-phase-1-chest-3", 4],
      ["source-legendary-chest-weeks-5-8-2", 2],
      ["source-legendary-chest-weeks-5-8-3", 2],
      ["source-shred-phase-2-shoulders-6", 2],
    ] as const)
      expect(exerciseMedia.exercises[id]).toHaveLength(count);
  });
  it("ships valid local images with original source attribution", () => {
    for (const refs of Object.values(exerciseMedia.exercises)) {
      for (const entry of refs)
        expect(exerciseMedia.references[entry.reference]).toBeDefined();
    }
    for (const ref of Object.values(exerciseMedia.references)) {
      expect(ref.images.length > 0 || !!ref.drawing, ref.title).toBe(true);
      if (ref.images.length) {
        expect(ref.source?.license).toBe("Unlicense");
        expect(ref.source?.url).toMatch(
          /^https:\/\/github.com\/yuhonas\/free-exercise-db\//,
        );
      }
      for (const image of [
        ...ref.images,
        ...(ref.drawing ? [ref.drawing] : []),
      ]) {
        expect(image.src).toMatch(/^\/exercise-images\/[a-z0-9-]+\.webp$/);
        const file = resolve("public", image.src.slice(1));
        expect(existsSync(file), image.src).toBe(true);
        const bytes = readFileSync(file);
        expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
        expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
        expect(image.width).toBeGreaterThan(100);
        expect(image.height).toBeGreaterThan(100);
        expect(image.alt.length).toBeGreaterThan(15);
      }
      if (ref.drawing) {
        expect(ref.drawing.source).toBe("Building-a-Legendary-Chest.pdf");
        expect(ref.drawing.page).toBeGreaterThanOrEqual(9);
        expect(ref.drawing.page).toBeLessThanOrEqual(24);
      }
    }
  });
  it("discloses variant differences and never uses a different exercise for missing home photos", () => {
    expect(Object.keys(exerciseMedia.missing).sort()).toEqual([
      "prone-w",
      "wall-push",
    ]);
    expect(exerciseMedia.exercises["wall-push"]).toBeUndefined();
    expect(exerciseMedia.exercises["prone-w"]).toBeUndefined();
    expect(
      exerciseMedia.exercises["source-shred-phase-2-shoulders-3"][0].note,
    ).toContain("thumbs up");
    expect(
      exerciseMedia.exercises["source-shred-phase-2-back-5"][0].note,
    ).toContain("underhand");
    expect(exerciseMedia.exercises["plank"]).toHaveLength(1);
    expect(exerciseMedia.references.plank.images).toHaveLength(1);
    expect(exerciseMedia.references.plank.images[0].label).toBe(
      "Hold position",
    );
  });
});
