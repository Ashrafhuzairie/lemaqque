import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { allSourceWorkouts, createSourceTemplates } from "../src/lib/programs";
let db: PGlite;
const A = "11111111-1111-4111-8111-111111111111",
  B = "22222222-2222-4222-8222-222222222222",
  S = "33333333-3333-4333-8333-333333333333";
let templates: Awaited<ReturnType<typeof createSourceTemplates>>;
async function user(id: string) {
  await db.exec(
    `reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`,
  );
}
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create schema auth;create table auth.users(id uuid primary key);create role anon nologin;create role authenticated nologin;grant usage on schema public,auth to anon,authenticated;create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create function auth.jwt() returns jsonb language sql stable as $$select '{}'::jsonb$$;insert into auth.users values('${A}'),('${B}');`,
  );
  for (const file of [
    "202611010001_core.sql",
    "202611010003_catalog.sql",
    "202611020001_source_prescriptions.sql",
    "202611020002_source_catalog.sql",
  ])
    await db.exec(readFileSync("supabase/migrations/" + file, "utf8"));
  templates = await createSourceTemplates(A, allSourceWorkouts);
}, 30000);
afterAll(async () => {
  await db?.close();
});
describe("source import database contract", () => {
  it("atomically imports twenty exact templates and is idempotent", async () => {
    await user(A);
    expect(
      (
        await db.query<{ import_source_templates: number }>(
          "select import_source_templates($1::jsonb)",
          [JSON.stringify(templates)],
        )
      ).rows[0].import_source_templates,
    ).toBe(20);
    expect(
      (
        await db.query<{ import_source_templates: number }>(
          "select import_source_templates($1::jsonb)",
          [JSON.stringify(templates)],
        )
      ).rows[0].import_source_templates,
    ).toBe(0);
    const rows = await db.query<{ id: string; exercises: unknown }>(
      "select id,exercises from workout_templates",
    );
    expect(rows.rows).toHaveLength(20);
    for (const t of templates)
      expect(rows.rows.find((r) => r.id === t.id)?.exercises).toEqual(
        t.exercises,
      );
  });
  it("keeps source-less custom validation and rejects altered source counts", async () => {
    await user(A);
    await expect(
      db.query(
        "insert into workout_templates(user_id,name,split,exercises) values($1,$2,$3,$4::jsonb)",
        [
          A,
          "Invalid custom",
          "Custom",
          JSON.stringify([{ exercise_id: "curl", sets: 3, reps: 10, rest: 0 }]),
        ],
      ),
    ).rejects.toThrow(/Invalid exercise/);
    const invalid = structuredClone(templates[0]);
    invalid.id = "44444444-4444-4444-8444-444444444444";
    invalid.exercises[0].sets = 1;
    await expect(
      db.query("select import_source_templates($1::jsonb)", [
        JSON.stringify([invalid]),
      ]),
    ).rejects.toThrow(/Invalid source/);
  });
  it("rejects forged owner IDs and hides imported source templates from another account", async () => {
    await user(B);
    expect(
      (await db.query("select * from workout_templates")).rows,
    ).toHaveLength(0);
    await expect(
      db.query("select import_source_templates($1::jsonb)", [
        JSON.stringify(templates),
      ]),
    ).rejects.toThrow(/Owner mismatch/);
  });
  it("persists composite actual logs without flattening movement loads and enforces ownership", async () => {
    await user(A);
    await db.query(
      "insert into workout_sessions(id,user_id,template_id,name,status,exercises) values($1,$2,$3,$4,$5,$6::jsonb)",
      [
        S,
        A,
        templates[0].id,
        "Source session",
        "active",
        JSON.stringify(templates[0].exercises),
      ],
    );
    const parts = [
      { label: "Press", reps: 10, weight: 20, unit: "reps", multiplier: 1 },
      { label: "Fly", reps: 15, weight: 10, unit: "reps", multiplier: 1 },
    ];
    await db.query(
      "insert into set_logs(user_id,session_id,exercise_id,set_number,reps,weight,rpe,completed,segments) values($1,$2,$3,1,0,0,7,true,$4::jsonb)",
      [A, S, templates[0].exercises[0].exercise_id, JSON.stringify(parts)],
    );
    expect(
      (await db.query<{ segments: unknown }>("select segments from set_logs"))
        .rows[0].segments,
    ).toEqual(parts);
    await user(B);
    expect((await db.query("select * from set_logs")).rows).toHaveLength(0);
  });
  it("rejects invalid component logs", async () => {
    await user(A);
    await expect(
      db.query(
        "insert into set_logs(user_id,session_id,exercise_id,set_number,reps,weight,rpe,completed,segments) values($1,$2,$3,2,0,0,7,true,$4::jsonb)",
        [
          A,
          S,
          templates[0].exercises[0].exercise_id,
          JSON.stringify([
            {
              label: "Fly",
              reps: 10,
              weight: -20,
              unit: "reps",
              multiplier: 1,
            },
          ]),
        ],
      ),
    ).rejects.toThrow(/Invalid logged segment/);
  });
});
