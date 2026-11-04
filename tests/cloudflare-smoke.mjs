// Apply the shipped Pages header rules to the real preview responses, then drive
// the production/offline smoke in Chromium. This does not claim a remote deploy.
import { createServer, request } from "node:http";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const upstream = new URL(process.env.APP_ORIGIN || "http://127.0.0.1:4173");
const rules = [];
for (const line of readFileSync("dist/_headers", "utf8").split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  if (!/^\s/.test(line)) rules.push({ path: line.trim(), headers: {} });
  else {
    const separator = line.indexOf(":");
    assert(separator > 0 && rules.length, "Invalid Cloudflare header rule");
    rules.at(-1).headers[line.slice(0, separator).trim().toLowerCase()] = line
      .slice(separator + 1)
      .trim();
  }
}
const server = createServer((req, res) => {
  const path = new URL(req.url, upstream).pathname;
  const applied = Object.assign(
    {},
    ...rules
      .filter((rule) =>
        rule.path.endsWith("*")
          ? path.startsWith(rule.path.slice(0, -1))
          : path === rule.path,
      )
      .map((rule) => rule.headers),
  );
  const proxy = request(
    new URL(req.url, upstream),
    { method: req.method },
    (response) => {
      res.writeHead(response.statusCode, { ...response.headers, ...applied });
      response.pipe(res);
    },
  );
  proxy.on("error", () => {
    res.writeHead(502);
    res.end("Preview unavailable");
  });
  req.pipe(proxy);
});
try {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(origin + "/app/workouts");
  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-security-policy"),
    /frame-ancestors 'none'/,
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
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
    "Production smoke failed with Cloudflare security headers",
  );
  console.log(
    "PASS: shipped Cloudflare headers, SPA routes, CSP-compatible app and offline assets",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
