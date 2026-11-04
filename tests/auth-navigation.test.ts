import { describe, expect, it } from "vitest";
import { accountPath } from "../src/lib/auth-navigation";
describe("account return navigation", () => {
  it("retains member program selections and workspace destinations", () => {
    expect(accountPath("/app/programs?program=shred#training")).toBe(
      "/app/programs?program=shred#training",
    );
    expect(accountPath("/app/session/real-session")).toBe(
      "/app/session/real-session",
    );
  });
  it.each([
    null,
    "https://example.com/app",
    "//example.com/app",
    "/\\example.com/app",
    "/features",
    "/app/../../auth",
  ])("rejects non-workspace or external destinations: %s", (value) =>
    expect(accountPath(value)).toBe("/app"),
  );
});
