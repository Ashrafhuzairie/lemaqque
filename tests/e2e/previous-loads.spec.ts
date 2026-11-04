import { openMemberWorkspace } from "../member-fixture.mjs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const weight = (page: import("@playwright/test").Page, part: number) =>
  page.getByRole("spinbutton", {
    name: new RegExp(`Load · kg (total|per side) · Set 1 part ${part}$`),
  });
const reps = (page: import("@playwright/test").Page, part: number) =>
  page.getByRole("spinbutton", {
    name: `Actual reps · Set 1 part ${part}`,
    exact: true,
  });

test("repeat a source workout with prior actual single and ladder loads, preserving current reps, effort and completion", async ({
  page,
}) => {
  test.setTimeout(65000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/auth");
  await openMemberWorkspace(page);
  await page.goto("/app/programs");
  await page
    .getByRole("button", { name: "Add this workout", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "1 exact source template added" }),
  ).toBeVisible();
  await page.goto("/app/workouts");
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page.locator(".source-set")).toHaveCount(6);
  await expect(
    page.getByRole("button", { name: "Use previous load", exact: true }),
  ).toHaveCount(0);
  await weight(page, 1).fill("42.5");
  await reps(page, 1).fill("14");
  await page
    .getByRole("spinbutton", { name: "Set effort · RPE · Set 1", exact: true })
    .fill("8");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.getByLabel("Current exercise", { exact: true }).selectOption("2");
  await expect(
    page.locator(".source-set").first().locator(".source-segment"),
  ).toHaveCount(9);
  for (let part = 1; part <= 9; part++)
    await weight(page, part).fill(String(part));
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good work. Take it with you." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to workouts", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  const previous = page.locator(".source-set").first().locator(".previous-set");
  await expect(previous).toContainText("14 reps · 42.5 kg total");
  await expect(previous).toContainText("Previous effort: 8/10 RPE");
  await expect(weight(page, 1)).toHaveValue("0");
  await expect(reps(page, 1)).toHaveValue("15");
  await reps(page, 1).fill("12");
  await page
    .getByRole("spinbutton", { name: "Set effort · RPE · Set 1", exact: true })
    .fill("6");
  await page
    .getByRole("button", { name: "Use previous load", exact: true })
    .click();
  await expect(weight(page, 1)).toHaveValue("42.5");
  await expect(reps(page, 1)).toHaveValue("12");
  await expect(
    page.getByRole("spinbutton", {
      name: "Set effort · RPE · Set 1",
      exact: true,
    }),
  ).toHaveValue("6");
  await expect(page.locator(".source-set-complete")).toHaveCount(0);
  await expect(page.locator(".source-prescription")).toContainText(
    "15 reps · warm-up",
  );
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Use previous load", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Use previous load", exact: true }),
  ).toBeEnabled();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(350);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(
      accessibility.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `.impeccable/review/history-${width}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.locator(".source-set-complete > summary").click();
  await expect(weight(page, 1)).toHaveValue("42.5");
  await expect(reps(page, 1)).toHaveValue("12");
  await page.getByLabel("Current exercise", { exact: true }).selectOption("2");
  await expect(
    page.getByRole("button", { name: "Use previous loads", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".source-set").first().locator(".previous-set-parts li"),
  ).toHaveCount(9);
  await reps(page, 1).fill("11");
  await page
    .getByRole("spinbutton", { name: "Set effort · RPE · Set 1", exact: true })
    .fill("5");
  await page
    .getByRole("button", { name: "Use previous loads", exact: true })
    .click();
  for (let part = 1; part <= 9; part++)
    await expect(weight(page, part)).toHaveValue(String(part));
  await expect(reps(page, 1)).toHaveValue("11");
  await expect(reps(page, 2)).toHaveValue("5");
  await expect(
    page.getByRole("spinbutton", {
      name: "Set effort · RPE · Set 1",
      exact: true,
    }),
  ).toHaveValue("5");
  await expect(page.locator(".source-set-complete")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("custom plans compare the same set number and copy only the selected set's load", async ({
  page,
}) => {
  await page.goto("/auth");
  await openMemberWorkspace(page);
  await page.getByLabel("Your name", { exact: true }).fill("History test");
  await page.getByLabel("3D display").selectOption("static");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "preferences are saved" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Generate a starter plan" }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .first()
    .click();
  await page
    .getByRole("spinbutton", { name: "Set 1 weight kg", exact: true })
    .fill("20");
  await page
    .getByRole("spinbutton", { name: "Set 1 reps", exact: true })
    .fill("9");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".set-complete")).toHaveCount(1);
  await page
    .getByRole("spinbutton", { name: "Set 2 weight kg", exact: true })
    .fill("25");
  await page
    .getByRole("spinbutton", { name: "Set 2 reps", exact: true })
    .fill("8");
  await page
    .getByRole("button", { name: "Complete set 2", exact: true })
    .click();
  await expect(page.locator(".set-complete")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Good work. Take it with you." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to workouts", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .first()
    .click();
  const first = page.locator(".set-row").nth(0),
    second = page.locator(".set-row").nth(1);
  await expect(first.locator(".previous-set")).toContainText("9 reps · 20 kg");
  await expect(second.locator(".previous-set")).toContainText("8 reps · 25 kg");
  await page
    .getByRole("spinbutton", { name: "Set 1 reps", exact: true })
    .fill("6");
  await page
    .getByRole("spinbutton", { name: "Set 1 RPE", exact: true })
    .fill("5");
  await first
    .getByRole("button", { name: "Use previous load", exact: true })
    .click();
  await expect(
    page.getByRole("spinbutton", { name: "Set 1 weight kg", exact: true }),
  ).toHaveValue("20");
  await expect(
    page.getByRole("spinbutton", { name: "Set 2 weight kg", exact: true }),
  ).toHaveValue("0");
  await expect(
    page.getByRole("spinbutton", { name: "Set 1 reps", exact: true }),
  ).toHaveValue("6");
  await expect(
    page.getByRole("spinbutton", { name: "Set 1 RPE", exact: true }),
  ).toHaveValue("5");
  await expect(page.locator(".set-complete")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: ".impeccable/review/history-custom-mobile.png",
    fullPage: true,
  });
});
