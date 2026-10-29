import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
let db: PGlite;
const alice = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  bob = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
  draft = "dddddddd-dddd-4ddd-dddd-dddddddddddd";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth, public to authenticated; grant execute on function auth.uid() to authenticated; insert into auth.users values('${alice}'),('${bob}');`,
  );
  await db.exec(
    readFileSync("supabase/migrations/202610280001_foundation.sql", "utf8"),
  );
  await db.exec(
    readFileSync("supabase/migrations/202610280002_training.sql", "utf8"),
  );
  await db.exec(
    readFileSync("supabase/migrations/202610280003_error_bank.sql", "utf8"),
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/202610290004_diagnostic_skills.sql",
      "utf8",
    ),
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/202610290005_independent_tasks.sql",
      "utf8",
    ),
  );
}, 30000);
afterAll(async () => {
  await db.close();
});
async function asUser(id: string) {
  await db.exec(
    `reset role; set request.jwt.claim.sub = '${id}'; set role authenticated;`,
  );
}
it("persists a version and rejects stale writes without overwriting", async () => {
  await asUser(alice);
  const saved = await db.query<{ result: { revision: number } }>(
    `select public.save_writing_draft('${draft}',0,'My first argument','Practice') as result`,
  );
  expect(saved.rows[0].result.revision).toBe(1);
  await db.query(
    `select public.save_writing_draft('${draft}',1,'My second argument','Practice')`,
  );
  const stale = await db.query<{ result: null }>(
    `select public.save_writing_draft('${draft}',1,'stale overwrite','Practice') as result`,
  );
  expect(stale.rows[0].result).toBeNull();
  expect(
    (await db.query<{ text: string }>("select text from public.writing_drafts"))
      .rows[0].text,
  ).toBe("My second argument");
  expect(
    (await db.query("select * from public.writing_versions")).rows,
  ).toHaveLength(2);
});
it("RLS hides another user drafts and versions, RPC cannot change them", async () => {
  await asUser(bob);
  expect(
    (await db.query("select * from public.writing_drafts")).rows,
  ).toHaveLength(0);
  expect(
    (await db.query("select * from public.writing_versions")).rows,
  ).toHaveLength(0);
  const foreign = await db.query<{ result: null }>(
    `select public.save_writing_draft('${draft}',2,'attack','Practice') as result`,
  );
  expect(foreign.rows[0].result).toBeNull();
  await expect(
    db.query(`update public.writing_drafts set text='attack'`),
  ).rejects.toThrow(/permission denied/);
});
it("anonymous caller cannot invoke the mutating function", async () => {
  await db.exec("reset role; set role anon;");
  await expect(
    db.query(
      `select public.save_writing_draft('${draft}',2,'attack','Practice')`,
    ),
  ).rejects.toThrow(/permission denied/);
});

it("stores immutable study history and prevents cross-user writes and deletes", async () => {
  await asUser(alice);
  await db.query(
    `insert into public.study_activities(id,user_id,skill,minutes,studied_on) values ('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee','${alice}','speaking',25,'2026-10-28')`,
  );
  await expect(
    db.query(
      `insert into public.study_activities(id,user_id,skill,minutes,studied_on) values ('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee','${alice}','speaking',25,'2026-10-28')`,
    ),
  ).rejects.toThrow(/duplicate key/);
  await expect(
    db.query("update public.study_activities set minutes=180"),
  ).rejects.toThrow(/permission denied/);
  await asUser(bob);
  expect(
    (await db.query("select * from public.study_activities")).rows,
  ).toHaveLength(0);
  await db.query("delete from public.study_activities");
  await expect(
    db.query(
      `insert into public.study_activities(id,user_id,skill,minutes,studied_on) values ('ffffffff-ffff-4fff-afff-ffffffffffff','${alice}','speaking',25,'2026-10-28')`,
    ),
  ).rejects.toThrow(/row-level security/);
  await asUser(alice);
  expect(
    (await db.query("select * from public.study_activities")).rows,
  ).toHaveLength(1);
  await db.query("delete from public.study_activities");
  expect(
    (await db.query("select * from public.study_activities")).rows,
  ).toHaveLength(0);
});
it("validates plan constraints and diagnostic ownership", async () => {
  await asUser(alice);
  await expect(
    db.query(
      `insert into public.study_plans(id,user_id,start_date,exam_date,weekly_minutes) values ('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee','${alice}','2026-10-28','2026-10-01',390)`,
    ),
  ).rejects.toThrow(/check constraint/);
  await db.query(
    `insert into public.study_plans(id,user_id,start_date,weekly_minutes) values ('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee','${alice}','2026-10-28',390)`,
  );
  await db.query(
    `insert into public.diagnostic_submissions(id,user_id,payload) values ('eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee','${alice}','{"id":"eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee","kind":"reading","version":"sensors-v1","answers":[0,1,2,1]}')`,
  );
  await asUser(bob);
  expect(
    (await db.query("select * from public.study_plans")).rows,
  ).toHaveLength(0);
  expect(
    (await db.query("select * from public.diagnostic_submissions")).rows,
  ).toHaveLength(0);
  await expect(
    db.query(
      `insert into public.diagnostic_submissions(id,user_id,payload) values ('ffffffff-ffff-4fff-afff-ffffffffffff','${bob}','{}')`,
    ),
  ).rejects.toThrow(/check constraint/);
});
it("accepts the new metadata-only diagnostic kinds while preserving RLS and rejecting audio", async () => {
  await asUser(alice);
  const listeningId = "abababab-abab-4bab-abab-abababababab";
  const speakingId = "cdcdcdcd-cdcd-4dcd-adcd-cdcdcdcdcdcd";
  const listening = {
    id: listeningId,
    kind: "listening",
    version: "library-evenings-v1",
    mode: "practice",
    answers: [0, 1, 2, 1, 2],
    playCount: 1,
    completedListens: 1,
    transcriptViewed: false,
  };
  const speaking = {
    id: speakingId,
    kind: "speaking",
    version: "community-decision-v1",
    completed: true,
    audioRetained: false,
    durationSeconds: null,
    durationReliable: false,
    interrupted: false,
    assisted: false,
    notes: "No audio saved",
  };
  await db.query(
    "insert into public.diagnostic_submissions(id,user_id,payload) values ($1,$2,$3)",
    [listeningId, alice, JSON.stringify(listening)],
  );
  await expect(
    db.query(
      "insert into public.diagnostic_submissions(id,user_id,payload) values ($1,$2,$3)",
      [speakingId, alice, JSON.stringify({ ...speaking, audio: "forbidden" })],
    ),
  ).rejects.toThrow(/check constraint/);
  await expect(
    db.query(
      "insert into public.diagnostic_submissions(id,user_id,payload) values ($1,$2,$3)",
      [speakingId, alice, JSON.stringify({ ...speaking, audioRetained: null })],
    ),
  ).rejects.toThrow(/check constraint/);
  await db.query(
    "insert into public.diagnostic_submissions(id,user_id,payload) values ($1,$2,$3)",
    [speakingId, alice, JSON.stringify(speaking)],
  );
  await asUser(bob);
  expect(
    (
      await db.query(
        "select * from public.diagnostic_submissions where id in ($1,$2)",
        [listeningId, speakingId],
      )
    ).rows,
  ).toHaveLength(0);
});

it("deduplicates normalized error patterns and retries while preserving ownership", async () => {
  await asUser(alice);
  const call = (
    event: string,
    pattern: string,
    text: string,
    example: string,
  ) =>
    db.query<{ id: string }>(
      `select public.record_error_observation('${event}','${pattern}','${text}','grammar','speaking','session-a','2026-10-28','error','${example}',false) as id`,
    );
  const id1 = "11111111-1111-4111-a111-111111111111",
    id2 = "22222222-2222-4222-a222-222222222222";
  const p1 = "33333333-3333-4333-a333-333333333333",
    p2 = "44444444-4444-4444-a444-444444444444";
  expect((await call(id1, p1, "Past tense", "I go yesterday")).rows[0].id).toBe(
    p1,
  );
  expect((await call(id1, p1, "Past tense", "I go yesterday")).rows[0].id).toBe(
    p1,
  );
  expect(
    (await call(id2, p2, " PAST   TENSE ", "Yesterday I go")).rows[0].id,
  ).toBe(p1);
  expect(
    (await db.query("select * from public.error_patterns")).rows,
  ).toHaveLength(1);
  expect(
    (await db.query("select * from public.error_observations")).rows,
  ).toHaveLength(2);
  await expect(call(id1, p1, "Past tense", "Changed content")).rejects.toThrow(
    /Operation conflict/,
  );
  await asUser(bob);
  expect(
    (await db.query("select * from public.error_observations")).rows,
  ).toHaveLength(0);
  await expect(call(id1, p1, "Past tense", "I go yesterday")).rejects.toThrow(
    /Operation conflict/,
  );
  await db.query("delete from public.error_patterns");
  await asUser(alice);
  expect(
    (await db.query("select * from public.error_patterns")).rows,
  ).toHaveLength(1);
  await db.query("delete from public.error_patterns");
  expect(
    (await db.query("select * from public.error_observations")).rows,
  ).toHaveLength(0);
});
it("rolls back a pattern if the first event claims success without an error", async () => {
  await asUser(alice);
  await expect(
    db.query(
      `select public.record_error_observation('55555555-5555-4555-a555-555555555555','66666666-6666-4666-a666-666666666666','Hypothesis','grammar','speaking','session-b','2026-10-28','correct','If we were ready',false)`,
    ),
  ).rejects.toThrow(/Record an error/);
  expect(
    (await db.query("select * from public.error_patterns")).rows,
  ).toHaveLength(0);
});
it("preserves task exposure across attempt deletion and isolates owners", async () => {
  await asUser(alice);
  await db.query(
    "insert into public.task_exposures(id,user_id,skill,version,stage) values ($1,$2,'reading','training-time-v1','solutions')",
    ["12121212-1212-4212-a212-121212121212", alice],
  );
  await db.query("delete from public.diagnostic_submissions");
  expect(
    (await db.query("select * from public.task_exposures")).rows,
  ).toHaveLength(1);
  await expect(
    db.query("update public.task_exposures set stage='opened'"),
  ).rejects.toThrow(/permission denied/);
  await asUser(bob);
  expect(
    (await db.query("select * from public.task_exposures")).rows,
  ).toHaveLength(0);
  await expect(
    db.query(
      "insert into public.task_exposures(id,user_id,skill,version,stage) values ($1,$2,'reading','training-time-v1','opened')",
      ["13131313-1313-4313-a313-131313131313", alice],
    ),
  ).rejects.toThrow(/row-level security/);
});
