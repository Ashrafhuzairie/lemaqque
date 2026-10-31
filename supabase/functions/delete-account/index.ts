import { createClient } from "npm:@supabase/supabase-js@2";
const headers = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST")
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers },
    );
  try {
    const token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token)
      return Response.json(
        { error: "Authentication required" },
        { status: 401, headers },
      );
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(token);
    if (error || !user)
      return Response.json(
        { error: "Invalid session" },
        { status: 401, headers },
      );
    const body = await request.json();
    if (body.confirmation !== "DELETE")
      return Response.json(
        { error: "Explicit confirmation required" },
        { status: 400, headers },
      );
    // Recursively list before removal so pagination never skips objects.
    const folders = [user.id];
    const paths: string[] = [];
    while (folders.length) {
      const prefix = folders.pop()!;
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await admin.storage
          .from("progress-photos")
          .list(prefix, { limit: 1000, offset });
        if (error) throw error;
        for (const object of data || []) {
          const path = prefix + "/" + object.name;
          if (object.id) paths.push(path);
          else folders.push(path);
        }
        if (paths.length > 10000 || folders.length > 1000)
          throw new Error("Storage cleanup needs operator assistance");
        if (!data || data.length < 1000) break;
      }
    }
    for (let i = 0; i < paths.length; i += 100) {
      const { error } = await admin.storage
        .from("progress-photos")
        .remove(paths.slice(i, i + 100));
      if (error) throw error;
    }
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return Response.json({ deleted: true }, { headers });
  } catch {
    return Response.json(
      {
        error:
          "Account deletion failed. Your account remains available; retry or contact the operator.",
      },
      { status: 500, headers },
    );
  }
});
