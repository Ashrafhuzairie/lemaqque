import { openMemberWorkspace } from "./member-fixture.mjs";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const origin = process.env.APP_ORIGIN || "http://127.0.0.1:4173";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: [
    "--no-sandbox",
    "--enable-webgl",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
try {
  const context = await browser.newContext({ timezoneId: "Asia/Kuala_Lumpur" });
  const page = await context.newPage();
  const errors = [];
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) =>
      window.__cspViolations.push(event.violatedDirective),
    );
  });
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(origin + "/");
  assert.equal(response.status(), 200);
  await page
    .getByRole("heading", { name: "Build your strongest self." })
    .waitFor();
  await page.waitForFunction(
    async () =>
      Boolean((await navigator.serviceWorker.getRegistration())?.active),
    null,
    { timeout: 30000 },
  );
  await page.evaluate(() => navigator.serviceWorker.ready);
  const manifest = await (
    await context.request.get(origin + "/manifest.webmanifest")
  ).json();
  assert(manifest.icons.some((i) => i.sizes === "192x192"));
  assert(manifest.icons.some((i) => i.sizes === "512x512"));
  await page.goto(origin + "/auth");
  await openMemberWorkspace(page);
  await page.getByLabel("Your name", { exact: true }).fill("Production smoke");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "preferences are saved" })
    .waitFor();
  await page.goto(origin + "/app/nutrition");
  await page.getByRole("button", { name: "Log a meal" }).waitFor();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Log a meal" }).waitFor();
  assert.equal(await page.evaluate(() => navigator.onLine), false);
  assert.equal(
    await page.evaluate(() => !!navigator.serviceWorker.controller),
    true,
  );
  await page.goto(origin + "/app/library?exercise=curl");
  const pictures = page.locator(".exercise-pictures[open] img");
  await pictures.first().waitFor({ state: "visible" });
  assert.equal(await pictures.count(), 2);
  for (const picture of await pictures.all()) {
    await picture.scrollIntoViewIfNeeded();
    await picture.evaluate((img) => img.decode());
    assert.equal(await picture.evaluate((img) => img.naturalWidth > 0), true);
  }
  // Brand assets must remain available after a cold offline route reload.
  for (const asset of ["/brand/lmq-icon.png", "/brand/lmq-wordmark.svg"]) {
    const image = page
      .locator(
        `.mobile-header img[src="${asset}"], .sidebar img[src="${asset}"]`,
      )
      .first();
    await image.evaluate((img) => img.decode());
    assert.equal(await image.evaluate((img) => img.naturalWidth > 0), true);
  }
  assert.deepEqual(await page.evaluate(() => window.__cspViolations), []);
  assert.deepEqual(errors, []);
  console.log(
    "PASS: production routes, manifest/icons, persisted profile, active service worker offline local nutrition route and bundled exercise photos",
  );
} finally {
  await browser.close();
}
