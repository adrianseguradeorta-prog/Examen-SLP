-- Run against a fresh Supabase project. No personal data in this migration.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 timezone text not null default 'Europe/Madrid',
 exam_date date,
 weekly_minutes integer not null default 390 check (weekly_minutes between 30 and 1500),
 created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy own_profile on public.profiles for select to authenticated using (id = auth.uid());
create policy update_own_profile on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create table public.writing_drafts (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 task text not null check(length(task) between 1 and 200),
 text text not null default '' check(length(text) <= 30000),
 revision bigint not null check(revision > 0),
 updated_at timestamptz not null default now(),
 unique(user_id,id)
);
create index writing_owner_recent on public.writing_drafts(user_id,updated_at desc);
create table public.writing_versions (
 id bigint generated always as identity primary key,
 user_id uuid not null,
 draft_id uuid not null,
 revision bigint not null,
 text text not null,
 saved_at timestamptz not null default now(),
 unique(draft_id, revision),
 foreign key(user_id,draft_id) references public.writing_drafts(user_id,id) on delete cascade
);
alter table public.writing_drafts enable row level security;
alter table public.writing_versions enable row level security;
create policy own_drafts on public.writing_drafts for select to authenticated using(user_id=auth.uid());
create policy own_versions on public.writing_versions for select to authenticated using(user_id=auth.uid());
revoke all on public.writing_drafts, public.writing_versions from anon, authenticated;
grant select on public.writing_drafts, public.writing_versions to authenticated;
-- Only this function can mutate drafts: owner comes from verified JWT, never payload.
create function public.save_writing_draft(draft_id uuid, base_revision bigint, draft_text text, task_title text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); saved public.writing_drafts;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 if length(draft_text)>30000 or length(task_title) not between 1 and 200 or base_revision<0 then raise exception 'Invalid draft'; end if;
 if base_revision=0 then
  insert into public.writing_drafts(id,user_id,task,text,revision)
  values(draft_id,actor,task_title,draft_text,1)
  on conflict(id) do nothing returning * into saved;
 else
  update public.writing_drafts set text=draft_text,revision=revision+1,updated_at=now()
  where id=draft_id and user_id=actor and revision=base_revision returning * into saved;
 end if;
 if saved.id is null then return null; end if;
 insert into public.writing_versions(user_id,draft_id,revision,text) values(actor,saved.id,saved.revision,saved.text);
 return to_jsonb(saved);
end;
$$;
revoke all on function public.save_writing_draft(uuid,bigint,text,text) from public,anon;
grant execute on function public.save_writing_draft(uuid,bigint,text,text) to authenticated;
-- No public registration required: create initial user in Auth admin UI.
