// Use Wrangler's real local Workers runtime so asset routing, redirects and
// response headers are exercised together. No Cloudflare deployment is made.
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { once } from "node:events";
import assert from "node:assert/strict";

const reserved = createServer();
await new Promise((resolve) => reserved.listen(0, "127.0.0.1", resolve));
const port = reserved.address().port;
await new Promise((resolve) => reserved.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const runtime = spawn(
  process.execPath,
  [
    "node_modules/wrangler/bin/wrangler.js",
    "dev",
    "--local",
    "--ip",
    "127.0.0.1",
    "--port",
    String(port),
    "--inspector-port",
    "0",
  ],
  {
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let output = "";
for (const stream of [runtime.stdout, runtime.stderr]) {
  stream.on("data", (chunk) => {
    output = (output + chunk.toString()).slice(-12000);
  });
}
const stopped = once(runtime, "exit");
try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (runtime.exitCode !== null)
      throw new Error(`Wrangler stopped before becoming ready:\n${output}`);
    try {
      const response = await fetch(origin, {
        headers: { Accept: "text/html", "Sec-Fetch-Mode": "navigate" },
        signal: AbortSignal.timeout(1000),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* The local runtime is still starting. */
    }
    await delay(250);
  }
  assert(ready, `Wrangler did not become ready:\n${output}`);
  for (const path of [
    "/",
    "/index.html",
    "/index",
    "/app/workouts",
    "/app/session/route-check",
    "/auth?mode=recovery",
  ]) {
    const response = await fetch(origin + path, {
      headers: { Accept: "text/html", "Sec-Fetch-Mode": "navigate" },
    });
    assert.equal(
      response.status,
      200,
      `${path} must resolve without a redirect loop`,
    );
    if (path === "/index.html")
      assert.equal(
        response.redirected,
        false,
        "The precached app shell must be served directly",
      );
    assert.match(response.headers.get("content-type"), /text\/html/);
    assert.match(await response.text(), /<div id="root"><\/div>/);
    assert.match(
      response.headers.get("content-security-policy"),
      /frame-ancestors 'none'/,
    );
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
  }
  const icon = await fetch(origin + "/brand/lmq-icon.png");
  assert.equal(icon.status, 200);
  assert.match(icon.headers.get("content-type"), /image\/png/);
  assert.equal(
    (await fetch(origin + "/sw.js")).headers.get("cache-control"),
    "no-cache",
  );
  const status = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["tests/production-smoke.mjs"], {
      stdio: "inherit",
      env: { ...process.env, APP_ORIGIN: origin },
    });
    child.once("error", reject);
    child.once("exit", resolve);
  });
  assert.equal(
    status,
    0,
    "Production smoke failed in the Cloudflare Workers runtime",
  );
  console.log(
    "PASS: real Workers asset routing, canonical URLs, deep links, security headers, CSP and offline assets",
  );
} finally {
  runtime.kill("SIGTERM");
  await Promise.race([
    stopped,
    delay(3000).then(() => runtime.kill("SIGKILL")),
  ]);
}
