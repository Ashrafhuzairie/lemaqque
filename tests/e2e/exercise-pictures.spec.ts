import { test, expect } from "@playwright/test";

async function localWorkspace(page: import("@playwright/test").Page) {
  await page.goto("/auth");
  await page
    .getByRole("button", { name: "Open device-local workspace" })
    .click();
}
async function expectDecodedPictures(page: import("@playwright/test").Page) {
  const pictures = page.locator(
    ".exercise-pictures[open] > .exercise-picture-content > .exercise-reference-list > .exercise-reference > .exercise-photo-grid img",
  );
  await expect(pictures.first()).toBeVisible();
  expect(await pictures.count()).toBeGreaterThan(0);
  for (const picture of await pictures.all()) {
    await picture.scrollIntoViewIfNeeded();
    await expect(picture).toBeVisible();
    await expect
      .poll(() =>
        picture.evaluate(
          (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
}

test("library includes source movements, real photos, PDF drawings and accessible enlargement", async ({
  page,
}) => {
  await localWorkspace(page);
  await page.goto("/app/library");
  await page.getByLabel("Search movements").fill("spider");
  await expect(page.locator(".library-row")).toHaveCount(2);
  await page.goto("/app/library?exercise=curl");
  await expect(
    page.getByRole("heading", { name: "Dumbbell biceps curl", exact: true }),
  ).toBeVisible();
  await expectDecodedPictures(page);
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    ),
  ).toEqual([]);
  const enlarge = page.getByRole("link", {
    name: /Enlarge Dumbbell Bicep Curl, reference position 1/,
  });
  await enlarge.focus();
  const popupPromise = page.waitForEvent("popup");
  await page.keyboard.press("Enter");
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(popup.url()).toContain("/exercise-images/db-curl-1.webp");
  await popup.close();
  await page.screenshot({
    path: ".impeccable/review/exercise-photos-desktop.png",
    fullPage: true,
  });

  await page.goto("/app/library?exercise=source-legendary-chest-weeks-5-8-2");
  await expect(page.locator(".exercise-reference")).toHaveCount(2);
  await expect(page.locator(".picture-credit").first()).toContainText(
    "PDF p. 16",
  );
  await expectDecodedPictures(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".impeccable/review/exercise-photos-mobile.png",
    fullPage: true,
  });
  await page.goto("/app/library?exercise=wall-push");
  await expect(page.locator(".picture-missing")).toContainText(
    "exact wall push-up photo is not available",
  );
  await expect(
    page.getByRole("heading", { name: "Movement checkpoints" }),
  ).toBeVisible();
});

test("all program components display pictures and logging survives image failures", async ({
  page,
}) => {
  await localWorkspace(page);
  await page.goto("/app/library?exercise=source-bulk-legs-1");
  await expect(page.locator(".exercise-reference")).toHaveCount(3);
  await expectDecodedPictures(page);
  await page.goto("/app/programs");
  await expect(
    page.locator(".source-movement").first().locator(".exercise-pictures"),
  ).toBeVisible();
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
    .locator(".workout-card")
    .filter({
      has: page.getByRole("heading", { name: "Bulk · Chest", exact: true }),
    })
    .getByRole("button", { name: "Start workout" })
    .click();
  await expectDecodedPictures(page);
  await page.route("**/exercise-images/**", (route) => route.abort());
  await page.reload();
  await expect(page.locator(".picture-unavailable").first()).toContainText(
    "workout controls remain available",
  );
  await page
    .getByRole("spinbutton", { name: "Set 1 part 1 weight kg" })
    .fill("10");
  await page
    .getByRole("button", { name: "Complete set 1", exact: true })
    .click();
  await expect(page.locator(".source-set-complete")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
