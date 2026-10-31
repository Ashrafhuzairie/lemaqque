import { test, expect } from "@playwright/test";
test("all three source books import exactly, survive reload, and log complex source sets", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  await page.goto("/app/programs");
  await expect(
    page.getByRole("heading", { name: "Train beyond ordinary." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add all 20 templates" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "20 exact source templates added" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add all 20 templates" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "No duplicates or overwrites" }),
  ).toBeVisible();
  await page.screenshot({
    path: ".impeccable/review/programs-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".impeccable/review/programs-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/app/workouts");
  await expect(page.locator(".workout-card")).toHaveCount(20);
  await page.reload();
  await expect(page.locator(".workout-card")).toHaveCount(20);
  const card = page.locator(".workout-card").filter({
    has: page.getByRole("heading", { name: "Bulk · Chest", exact: true }),
  });
  await card.getByRole("button", { name: "Start workout" }).click();
  await expect(page.locator(".source-active-plan")).toContainText(
    "15 reps · warm-up",
  );
  await expect(page.locator(".source-active-plan")).toContainText("120s rest");
  await expect(page.locator(".source-set")).toHaveCount(6);
  await page
    .getByRole("spinbutton", { name: "Set 1 part 1 weight kg" })
    .fill("50");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.locator(".source-set-complete summary").click();
  await expect(
    page.getByRole("button", { name: "Uncomplete set 1" }),
  ).toBeVisible();
  await expect(page.locator(".session-summary")).toContainText("750");
  await page.getByRole("button", { name: "Next exercise" }).click();
  await expect(page.locator(".source-set")).toHaveCount(5);
  await expect(page.locator(".source-active-plan")).toContainText(
    "drop-set down 20 lbs",
  );
  await page.getByRole("button", { name: "Next exercise" }).click();
  await expect(page.locator(".source-set")).toHaveCount(4);
  await expect(
    page.locator(".source-set").first().locator(".source-segment"),
  ).toHaveCount(9);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.screenshot({
    path: ".impeccable/review/source-session-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .getByRole("spinbutton", { name: "Set 1 part 1 weight kg" })
    .fill("10");
  await page
    .getByRole("spinbutton", { name: "Set 1 part 2 weight kg" })
    .fill("20");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".session-summary")).toContainText("900");
  await page.goto("/app/programs?program=legendary-chest");
  await page.getByLabel("Training phase").selectOption("weeks-9-12");
  await expect(page.locator(".source-workout-detail")).toContainText(
    "No missing barbell dose is inferred.",
  );
  await page.goto("/app/nutrition?program=shred");
  await page.getByLabel("Body weight", { exact: true }).fill("125");
  await page.getByLabel("Weight unit").selectOption("lb");
  await expect(page.locator(".source-macros")).toContainText("1,681.25");
  await expect(page.locator(".source-macros")).toContainText("31.25");
  await page
    .getByLabel("Water target · ml (separate from PDF macros)")
    .fill("2000");
  await page.getByRole("button", { name: "Apply this calculation" }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Selected source calculation saved" }),
  ).toBeVisible();
  await page.getByLabel("Source diet stage").selectOption("refeed");
  await expect(page.locator(".source-macros")).toContainText("300");
  await expect(page.locator(".source-macros")).toContainText("2,181.25");
  await page
    .locator(".source-calculator")
    .screenshot({ path: ".impeccable/review/source-nutrition-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.screenshot({
    path: ".impeccable/review/source-nutrition-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Apply this calculation" }).click();
  await page.reload();
  await expect(page.locator(".nutrition-top")).toContainText("2,181.25");
  expect(errors).toEqual([]);
});
test("program views remain accessible on desktop and mobile", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/app/programs?program=shred");
    await page.waitForLoadState("networkidle");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact || ""),
      ),
    ).toEqual([]);
    await page
      .getByRole("button", { name: "Nutrition & calculations" })
      .click();
    const nutrition = await new AxeBuilder({ page }).analyze();
    expect(
      nutrition.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact || ""),
      ),
    ).toEqual([]);
  }
});
