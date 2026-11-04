import { openMemberWorkspace } from "../member-fixture.mjs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("unavailable cloud schema offers an explicit device fallback without losing device records", async ({
  page,
}) => {
  const url = process.env.VITE_SUPABASE_URL;
  test.skip(
    !url || !process.env.VITE_SUPABASE_ANON_KEY,
    "This UI fixture needs configured frontend Auth; all cloud responses are mocked.",
  );
  const host = new URL(url!).hostname,
    storageKey = `sb-${host.split(".")[0]}-auth-token`;
  await page.route(`https://${host}/rest/v1/**`, (route) =>
    route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        code: "PGRST205",
        message: "Could not find the table in the schema cache",
      }),
    }),
  );
  // Fixture credentials never leave the browser: Auth endpoints are intercepted too.
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated",
    role: "authenticated",
    email: "cloud-fixture@example.test",
    app_metadata: { provider: "email" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  await page.route(`https://${host}/auth/v1/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    }),
  );
  await page.goto("/auth");
  await openMemberWorkspace(page);
  await page.getByLabel("Your name", { exact: true }).fill("Device fixture");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "preferences are saved" }),
  ).toBeVisible();
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const encode = (x: unknown) =>
    Buffer.from(JSON.stringify(x)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", role: "authenticated", exp: expires })}.fixture-signature`;
  const session = {
    access_token: token,
    refresh_token: "fixture-only",
    expires_in: 3600,
    expires_at: expires,
    token_type: "bearer",
    user,
  };
  await page.evaluate(
    ({ storageKey, session }) => {
      localStorage.setItem(storageKey, JSON.stringify(session));
      localStorage.removeItem("lmq:mode");
    },
    { storageKey, session },
  );
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Cloud storage needs setup." }),
  ).toBeVisible();
  await expect(page.locator(".cloud-storage-fallback")).toContainText(
    "Account records stay separate",
  );
  await expect(page.locator(".cloud-storage-fallback")).not.toContainText(
    "PGRST205",
  );
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(350);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((v) =>
        ["critical", "serious"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `.impeccable/review/cloud-fallback-${width}.png`,
      fullPage: true,
    });
  }
  await page
    .getByRole("button", { name: "Open device workspace", exact: true })
    .click();
  await expect(page.locator(".dashboard-heading h1")).toContainText("Device");
  expect(await page.evaluate(() => localStorage.getItem("lmq:mode"))).toBe(
    "local",
  );
  await page.reload();
  await expect(page.locator(".dashboard-heading h1")).toContainText("Device");
  await expect(
    page.getByRole("heading", { name: "Cloud storage needs setup." }),
  ).toHaveCount(0);
});
