// Test-only account session. Every Auth/REST request to the configured project is
// intercepted; synthetic tokens are never sent to Supabase. No product bypass.
export function memberSession() {
  const url = process.env.VITE_SUPABASE_URL;
  if (!url || !process.env.VITE_SUPABASE_ANON_KEY)
    throw new Error(
      "Member browser fixtures require the public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY build configuration.",
    );
  const origin = new URL(url).origin;
  const storageKey = `sb-${new URL(url).hostname.split(".")[0]}-auth-token`;
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated",
    role: "authenticated",
    email: "member-fixture@example.test",
    app_metadata: { provider: "email" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", role: "authenticated", exp: expires })}.fixture-signature`;
  return {
    origin,
    storageKey,
    session: {
      access_token: token,
      refresh_token: "fixture-only",
      expires_in: 3600,
      expires_at: expires,
      token_type: "bearer",
      user,
    },
  };
}
export async function installMemberRoutes(page, { emptyCloud = false } = {}) {
  const fixture = memberSession();
  await page.context().route(`${fixture.origin}/auth/v1/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    const response = path.endsWith("/token")
      ? fixture.session
      : path.endsWith("/logout")
        ? {}
        : fixture.session.user;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
  await page.context().route(`${fixture.origin}/rest/v1/**`, (route) =>
    route.fulfill({
      status: emptyCloud ? 200 : 404,
      contentType: "application/json",
      body: JSON.stringify(
        emptyCloud
          ? []
          : { code: "PGRST205", message: "Fixture: cloud schema unavailable" },
      ),
    }),
  );
  return fixture;
}
export async function openMemberWorkspace(
  page,
  { path = "/app/settings", device = true } = {},
) {
  const { storageKey, session } = await installMemberRoutes(page);
  const current = page.url();
  await page.goto(
    current.startsWith("http") ? new URL("/auth", current).href : "/auth",
  );
  await page.evaluate(
    ({ storageKey, session, device }) => {
      localStorage.setItem(storageKey, JSON.stringify(session));
      if (device) localStorage.setItem("lmq:mode", "local");
      else localStorage.removeItem("lmq:mode");
    },
    { storageKey, session, device },
  );
  await page.goto(new URL(path, page.url()).href);
}
