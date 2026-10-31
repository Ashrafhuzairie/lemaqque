import { test, expect } from "@playwright/test";
test("persistent daily tracking workflow, nutrition, attendance, progress and static controls", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make it your own." }),
  ).toBeVisible();
  await page.getByLabel("Your name", { exact: true }).fill("Aisha");
  await page.getByLabel("3D display").selectOption("static");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toContainText("preferences are saved");
  await page.getByRole("button", { name: "Generate a starter plan" }).click();
  await expect(
    page.getByRole("heading", { name: "Your training, your terms." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start workout" }).first().click();
  await expect(
    page.getByRole("button", { name: "Finish workout" }),
  ).toBeVisible();
  await page.getByRole("spinbutton", { name: "Set 1 weight kg" }).fill("12.5");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Uncomplete set 1" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Uncomplete set 1" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Complete set 2", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Finish workout" }).click();
  await expect(
    page.getByRole("heading", { name: "Good work. Take it with you." }),
  ).toBeVisible();
  await page.goto("/app/nutrition");
  await page.getByRole("button", { name: "Log a meal" }).click();
  await page.getByLabel("Food name").fill("Label-verified oats");
  await page.getByLabel("Number of servings").fill("1.5");
  await page.getByLabel("Serving description").fill("One measured portion");
  await page.getByLabel("Calories · kcal per serving").fill("120");
  await page.getByLabel("Protein · g per serving", { exact: true }).fill("8");
  await page.getByLabel("Carbohydrates · g per serving").fill("14");
  await page.getByLabel("Fat · g per serving", { exact: true }).fill("3");
  await page
    .getByLabel("Nutrition source")
    .fill("Test fixture label — synthetic test values");
  await page.getByRole("button", { name: "Save meal entry" }).click();
  await expect(page.locator(".calorie-value")).toHaveText("180kcal");
  await page.reload();
  await expect(page.locator(".calorie-value")).toHaveText("180kcal");
  await page.getByRole("button", { name: "+ 250 ml" }).click();
  await expect(page.locator(".water-panel")).toContainText("250 ml logged");
  await page.goto("/app/attendance");
  await expect(page.locator(".attendance-stats")).toContainText(
    "1training days logged",
  );
  await page.goto("/app/progress");
  await page.getByRole("button", { name: "Log measurement" }).click();
  await page.getByLabel("Weight · kg", { exact: true }).fill("69.5");
  await page.getByRole("button", { name: "Save measurement" }).click();
  await expect(
    page.getByRole("cell", { name: "69.5 kg", exact: true }),
  ).toBeVisible();
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Good to see you, Aisha." }),
  ).toBeVisible();
  await page.screenshot({
    path: ".impeccable/review/desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: ".impeccable/review/mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.waitForTimeout(350);
  await page.screenshot({
    path: ".impeccable/review/mobile-drawer.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("link", { name: "Exercise library", exact: true })
    .click();
  await page.getByRole("link", { name: /Dumbbell biceps curl/ }).click();
  await expect(
    page.getByRole("heading", { name: "Static display selected." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("landing renders 3D and supports narrow reduced-motion use", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Build your strongest self." }),
  ).toBeVisible();
  await expect(page.locator(".performance-scene canvas")).toBeVisible({
    timeout: 20000,
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: ".impeccable/review/landing-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: ".impeccable/review/landing-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("3D unavailable does not block tracking or landing", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (...args: unknown[]) {
      if (String(args[0]).startsWith("webgl")) return null;
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(
    page.getByRole("img", { name: "LMQ abstract static graphic" }),
  ).toBeVisible();
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  await page.goto("/app/nutrition");
  await expect(page.getByRole("button", { name: "Log a meal" })).toBeEnabled();
});

test("landing and local forms have no serious automated accessibility violations", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const route of ["/", "/auth"]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ),
    ).toEqual([]);
  }
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
  for (const route of [
    "/app/settings",
    "/app/nutrition",
    "/app/attendance",
    "/app/library",
  ]) {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact || ""),
      ),
    ).toEqual([]);
  }
});
