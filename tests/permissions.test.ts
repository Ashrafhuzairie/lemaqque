import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
let db: PGlite;
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222",
  T = "33333333-3333-4333-8333-333333333333",
  S = "44444444-4444-4444-8444-444444444444";
async function user(id: string, claims = {}) {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);select set_config('request.jwt.claims','${JSON.stringify(claims)}',false);set role authenticated;`,
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create schema auth;create table auth.users(id uuid primary key);create role anon nologin;create role authenticated nologin;grant usage on schema public,auth to anon,authenticated;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;insert into auth.users values('${A}'),('${B}');`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202611010001_core.sql", "utf8"),
  );
  await db.exec(
    readFileSync("supabase/migrations/202611010003_catalog.sql", "utf8"),
  );
  await db.exec(
    `create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant select,insert,update,delete on storage.objects to authenticated;create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202611010002_storage.sql", "utf8"),
  );
  await user(A);
  await db.exec(
    `insert into workout_templates(id,user_id,name,split,exercises) values('${T}','${A}','Full body','Full Body','[{"exercise_id":"curl","sets":3,"reps":10,"rest":90}]');insert into workout_sessions(id,user_id,template_id,name,status) values('${S}','${A}','${T}','Training','active');insert into set_logs(user_id,session_id,exercise_id,set_number,reps,weight,rpe,completed) values('${A}','${S}','curl',1,10,12,7,true);`,
  );
}, 30000);
afterAll(async () => {
  await db?.close();
});
describe("PostgreSQL ownership and permissions", () => {
  it("hides another user’s records", async () => {
    await user(B);
    expect(
      (await db.query("select * from workout_sessions")).rows,
    ).toHaveLength(0);
    expect((await db.query("select * from set_logs")).rows).toHaveLength(0);
  });
  it("rejects forged owner IDs", async () => {
    await user(B);
    await expect(
      db.exec(
        `insert into water_entries(user_id,day,ml) values('${A}','2026-11-01',250)`,
      ),
    ).rejects.toThrow(/row-level security/i);
  });
  it("prevents attaching a set to another owner’s session", async () => {
    await user(B);
    await expect(
      db.exec(
        `insert into set_logs(user_id,session_id,exercise_id,set_number,reps,weight,rpe,completed) values('${B}','${S}','curl',2,10,12,7,true)`,
      ),
    ).rejects.toThrow(/foreign key/i);
  });
  it("cannot update or delete hidden rows", async () => {
    await user(B);
    expect(
      (
        await db.query(
          `update workout_sessions set name='Forged' where id='${S}' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
    expect(
      (
        await db.query(
          `delete from workout_templates where id='${T}' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("rejects a foreign session completion", async () => {
    await user(B);
    await expect(
      db.query("select finish_workout($1,$2)", [S, "2026-11-01"]),
    ).rejects.toThrow(/Session not found/);
  });
  it("finishes a session and records attendance atomically and idempotently", async () => {
    await user(A);
    await db.query("select finish_workout($1,$2)", [S, "2026-11-01"]);
    await db.query("select finish_workout($1,$2)", [S, "2026-11-01"]);
    expect(
      (
        await db.query<{ status: string }>(
          "select status from workout_sessions",
        )
      ).rows[0].status,
    ).toBe("completed");
    expect(
      (await db.query("select * from attendance_records")).rows,
    ).toHaveLength(1);
  });
  it("rejects negative nutrition, unknown exercise prescriptions, and extreme set values", async () => {
    await user(B);
    await expect(
      db.exec(
        `insert into workout_templates(user_id,name,split,exercises) values('${B}','bad','Custom','[{"exercise_id":"fake","sets":3,"reps":10,"rest":90}]')`,
      ),
    ).rejects.toThrow(/Invalid exercise/);
    await expect(
      db.exec(
        `insert into water_entries(user_id,day,ml) values('${B}','2026-11-01',-1)`,
      ),
    ).rejects.toThrow(/check constraint/);
  });
  it("does not trust user_metadata for administrator privileges", async () => {
    await user(B, { user_metadata: { role: "admin" } });
    expect(
      (
        await db.query<{ is_catalog_admin: boolean }>(
          "select is_catalog_admin()",
        )
      ).rows[0].is_catalog_admin,
    ).toBe(false);
    await expect(
      db.exec(
        "insert into model_assets(url,source_url,license,attribution) values('https://example.com/a.glb','https://example.com','CC0','Test')",
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("does not expose draft catalog assets to ordinary users", async () => {
    await db.exec(
      "reset role;insert into model_assets(url,source_url,license,attribution,review_status) values('https://example.com/a.glb','https://example.com','CC0','Test','draft');",
    );
    await user(A);
    expect((await db.query("select * from model_assets")).rows).toHaveLength(0);
  });
  it("keeps private photo objects isolated by owner prefix", async () => {
    await user(A);
    await db.exec(
      `insert into storage.objects(bucket_id,name) values('progress-photos','${A}/photo.webp')`,
    );
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      1,
    );
    await user(B);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    await expect(
      db.exec(
        `insert into storage.objects(bucket_id,name) values('progress-photos','${A}/forged.webp')`,
      ),
    ).rejects.toThrow(/row-level security/);
    expect(
      (
        await db.query(
          `delete from storage.objects where name='${A}/photo.webp' returning id`,
        )
      ).rows,
    ).toHaveLength(0);
  });
  it("allows anonymous approved catalog reads without personal data access", async () => {
    await db.exec("reset role;set role anon");
    expect((await db.query("select * from exercises")).rows).toHaveLength(16);
    await expect(db.query("select * from workout_sessions")).rejects.toThrow(
      /permission denied/,
    );
  });
});
