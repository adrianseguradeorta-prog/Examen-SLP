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
