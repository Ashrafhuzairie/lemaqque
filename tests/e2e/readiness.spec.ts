import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

const unfinished =
  /\b(beta|testing|demo|prototype|placeholder)\b|early-stage|coming soon/i;
async function localWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill("Readiness check");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "preferences are saved" }),
  ).toBeVisible();
}

test("public and daily-training routes are usable at desktop and mobile sizes without unfinished product sections", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/", "/programs", "/auth", "/privacy", "/pricing"]) {
    await page.goto(route);
    await expect(page.locator("h1,h2").first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(unfinished);
  }
  await localWorkspace(page);
  await page.getByRole("button", { name: "Generate a starter plan" }).click();
  await expect(
    page.getByRole("heading", { name: "My workouts", exact: true }),
  ).toBeVisible();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/app",
      "/app/workouts",
      "/app/builder",
      "/app/library",
      "/app/muscles",
      "/app/programs",
      "/app/nutrition",
      "/app/attendance",
      "/app/progress",
      "/app/coach",
      "/app/settings",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("main")).not.toContainText(unfinished);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} overflows at ${width}px`,
      ).toBe(true);
      const result = await new AxeBuilder({ page }).analyze();
      expect(
        result.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        ),
        `${route} accessibility at ${width}px`,
      ).toEqual([]);
      if (route === "/app/muscles") {
        const buttons = page.locator(".muscle-buttons button");
        await expect(buttons).toHaveCount(11);
        for (const button of await buttons.all()) {
          const name = await button.innerText();
          await button.click();
          await expect(page.locator(".muscle-info h2")).toHaveText(name);
          expect(
            await page.locator(".muscle-info > a").count(),
          ).toBeGreaterThan(0);
        }
        await page.screenshot({
          path: `.impeccable/review/readiness-muscles-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("custom workout editing, duplicate/delete, timed logging, export and device deletion preserve their contracts", async ({
  page,
}) => {
  test.setTimeout(90000);
  await localWorkspace(page);
  await page.goto("/app/builder");
  const name = "Release <img src=x onerror=window.__xss=1>";
  await page.getByLabel("Workout name", { exact: true }).fill(name);
  await page
    .locator(".exercise-picker button")
    .filter({ hasText: "Dumbbell biceps curl" })
    .first()
    .click();
  await page
    .locator(".exercise-picker button")
    .filter({ hasText: "Forearm plank" })
    .click();
  await page
    .locator(".prescription")
    .filter({ hasText: "Forearm plank" })
    .getByLabel("Target seconds")
    .fill("45");
  await page.getByRole("button", { name: "Move exercise up" }).nth(1).click();
  await expect(page.locator(".prescription-heading strong").first()).toHaveText(
    "Forearm plank",
  );
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  const card = page
    .locator(".workout-card")
    .filter({ has: page.getByRole("button", { name, exact: true }) });
  await expect(card).toBeVisible();
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __xss?: number }).__xss),
  ).toBeUndefined();
  await card
    .getByRole("button", { name: "Duplicate " + name, exact: true })
    .click();
  const copyName = name + " · copy";
  const copy = page
    .locator(".workout-card")
    .filter({ has: page.getByRole("button", { name: copyName, exact: true }) });
  await expect(copy).toBeVisible();
  await copy.getByRole("link", { name: "Edit plan" }).click();
  await page
    .getByLabel("Workout name", { exact: true })
    .fill("Release edited copy");
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete Release edited copy", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Release edited copy", exact: true }),
  ).toHaveCount(0);
  await card
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page.locator(".exercise-title h2")).toHaveText("Forearm plank");
  await expect(page.locator(".exercise-title p")).toContainText(
    "45 target seconds",
  );
  await page
    .getByRole("spinbutton", { name: "Set 1 seconds", exact: true })
    .fill("40");
  await page
    .getByRole("spinbutton", { name: "Set 1 weight kg", exact: true })
    .fill("20");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Uncomplete set 1", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".session-summary")).toContainText(/0\s*kg/);
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good work. Take it with you." }),
  ).toBeVisible();
  await page.goto("/app/workouts");
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete " + name, exact: true })
    .click();
  await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
  await page.goto("/app/settings");
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export my records" }).click();
  const path = await (await downloading).path();
  const exported = JSON.parse(await readFile(path!, "utf8"));
  expect(exported.mode).toBe("local");
  expect(exported.data.workout_templates).toHaveLength(0);
  expect(exported.data.workout_sessions).toHaveLength(1);
  expect(exported.data.workout_sessions[0].status).toBe("completed");
  expect(exported.data.set_logs[0]).toMatchObject({
    exercise_id: "plank",
    reps: 40,
    weight: 20,
    completed: true,
  });
  await page
    .getByRole("button", { name: "Delete local workspace", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep my data", exact: true }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Readiness check",
  );
  await page
    .getByRole("button", { name: "Delete local workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Delete permanently", exact: true })
    .click();
  await expect(page).toHaveURL("/auth");
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make it your own." }),
  ).toBeVisible();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue("");
});
