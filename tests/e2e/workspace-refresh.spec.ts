import { openMemberWorkspace } from "../member-fixture.mjs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("training workspace filters real plans, previews source movements, and keeps mobile logging accessible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/auth");
  await openMemberWorkspace(page);
  await page.goto("/app");
  await expect(page.locator(".dashboard-heading h1")).toBeVisible();
  await page.screenshot({
    path: ".impeccable/review/overview-empty-desktop.png",
    fullPage: true,
  });
  await page.goto("/app/programs");
  await page.getByRole("button", { name: "Add all 20 templates" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "20 exact source templates added" }),
  ).toBeVisible();
  await page.goto("/app");
  await expect(page.locator(".dashboard-plan-heading")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: ".impeccable/review/overview-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBe(390);
  const overviewAccessibility = await new AxeBuilder({ page }).analyze();
  expect(
    overviewAccessibility.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: ".impeccable/review/overview-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(350);
  await page.goto("/app/workouts");
  await expect(page.locator(".workout-card")).toHaveCount(20);
  await expect(
    page.locator(".workout-plan-preview").filter({ visible: true }),
  ).toHaveCount(1);
  await page.getByLabel("Program", { exact: true }).selectOption("bulk");
  await expect(page.locator(".workout-card")).toHaveCount(5);
  await page.getByLabel("Find a workout").fill("ladders");
  await expect(page.locator(".workout-card")).toHaveCount(1);
  await expect(page.locator(".plan-movements > li")).toHaveCount(5);
  await expect(page.locator(".workout-card")).toContainText(
    "26 sets incl. warm-ups",
  );
  await page.screenshot({
    path: ".impeccable/review/workouts-desktop.png",
    fullPage: true,
  });
  await page.getByLabel("Find a workout").fill("no such movement xyz");
  await expect(
    page.getByRole("heading", { name: "No matching plans" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".workout-card")).toHaveCount(20);
  await page.getByLabel("Program", { exact: true }).selectOption("bulk");
  await page.getByLabel("Find a workout").fill("ladders");
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    if (width === 768)
      await page.screenshot({
        path: ".impeccable/review/workouts-tablet.png",
        fullPage: true,
      });
    expect(
      result.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: ".impeccable/review/workouts-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Complete set 1", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("spinbutton", {
      name: "Actual reps · Set 1 part 1",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("spinbutton", {
      name: "Set effort · RPE · Set 1",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".exercise-pictures")).not.toHaveAttribute(
    "open",
    "",
  );
  await expect(
    page.getByLabel("Current exercise", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: ".impeccable/review/session-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(350);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: ".impeccable/review/session-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 900 });
  await page.waitForTimeout(350);
  await expect(
    page.getByRole("button", { name: "Discard session", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Discard session", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Keep training" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep training" }).click();
  await page
    .getByRole("spinbutton", {
      name: /Load · kg (total|per side) · Set 1 part 1$/,
    })
    .fill("10");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Next exercise", exact: true })
    .click();
  await expect(
    page.getByLabel("Current exercise", { exact: true }),
  ).toHaveValue("1");
  await page
    .getByRole("button", { name: "Previous exercise", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  expect(errors).toEqual([]);
});
