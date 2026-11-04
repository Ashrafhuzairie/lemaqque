/** Keep post-sign-in navigation inside the account workspace. */
export function accountPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/app";
  try {
    const target = new URL(value, "https://lmq.invalid");
    if (
      target.origin !== "https://lmq.invalid" ||
      !(target.pathname === "/app" || target.pathname.startsWith("/app/"))
    )
      return "/app";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/app";
  }
}
