import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { installMemberRoutes } from "../member-fixture.mjs";

test("public feature and sign-in screens show no guest entry or program prescriptions", async ({
  page,
}) => {
  test.setTimeout(70000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [route, name] of [
      ["/features", "features"],
      ["/auth", "account-entry"],
      ["/", "dumbbell-landing"],
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      if (route === "/") {
        await expect(
          page.getByLabel("Interactive 3D LMQ dumbbell", { exact: true }),
        ).toBeVisible();
        await page.waitForTimeout(900);
      }
      await page.evaluate(() => document.fonts.ready);
      await expect(
        page.getByRole("button", { name: "Open device-local workspace" }),
      ).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText(
        /or start without an account|No cloud account is created|Buendia|471 printed sets/,
      );
      await expect(page.locator(".source-workout-detail")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page }).analyze();
      expect(
        result.violations.filter((v) =>
          ["serious", "critical"].includes(v.impact ?? ""),
        ),
      ).toEqual([]);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({
        path: `.impeccable/review/${name}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.goto("/auth?mode=signup");
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open device-local workspace" }),
  ).toHaveCount(0);
  await page.goto("/features#nutrition");
  await expect(
    page.getByRole("heading", { name: "Keep your fuel in view." }),
  ).toBeVisible();
});

test("legacy guest storage cannot bypass account access, and real sign-in preserves the requested program", async ({
  page,
}) => {
  await installMemberRoutes(page, { emptyCloud: true });
  await page.goto("/auth");
  await page.evaluate(() => localStorage.setItem("lmq:mode", "local"));
  await page.goto("/programs?program=shred");
  await expect(page).toHaveURL(/\/auth\?next=/);
  expect(new URL(page.url()).searchParams.get("next")).toBe(
    "/app/programs?program=shred",
  );
  await expect(page.locator(".source-workout-detail")).toHaveCount(0);
  await page
    .getByLabel("Email", { exact: true })
    .fill("member-fixture@example.test");
  await page.getByLabel(/^Password/).fill("fixture-passphrase");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/app/programs?program=shred");
  await expect(
    page.getByRole("heading", { name: "Train beyond ordinary." }),
  ).toBeVisible();
  await expect(page.locator(".source-workout-detail")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("lmq:mode")),
  ).toBeNull();
  await page.goto("/programs?program=bulk");
  await expect(page).toHaveURL("/app/programs?program=bulk");
  await expect(page.locator(".source-workout-detail")).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\?next=/);
  await expect(page.locator(".source-workout-detail")).toHaveCount(0);
});

test("the gym hero responds to drag while reduced motion keeps it still at rest", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByLabel("Interactive 3D LMQ dumbbell", { exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(900);
  const canvas = page.locator(".performance-scene canvas");
  const before = await canvas.screenshot();
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(before)).toBe(true);
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(
    bounds.x + bounds.width * 0.45,
    bounds.y + bounds.height * 0.5,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.6,
    { steps: 15 },
  );
  await page.mouse.up();
  await page.waitForTimeout(350);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
  await expect(page.locator(".scene-caption")).toContainText("Drag to explore");
});
