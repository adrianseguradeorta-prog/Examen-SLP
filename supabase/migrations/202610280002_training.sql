-- Second increment: user-declared study history, never certified proficiency.
create table public.study_plans (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 start_date date not null, exam_date date,
 weekly_minutes integer not null check(weekly_minutes in (360,390,420)),
 policy_version text not null default 'initial-v1' check(policy_version='initial-v1'),
 created_at timestamptz not null default now(),
 check(exam_date is null or exam_date>=start_date)
);
create table public.study_activities (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 skill text not null check(skill in ('listening','speaking','reading','writing')),
 minutes integer not null check(minutes between 1 and 180),
 studied_on date not null, note text not null default '' check(length(note)<=500),
 created_at timestamptz not null default now()
);
create table public.diagnostic_submissions (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 payload jsonb not null,
 created_at timestamptz not null default now(),
 check(payload ?& array['id','kind','version']),
 check(payload->>'kind' in ('reading','writing')),
 check(payload->>'id'=id::text),
 check((payload->>'kind'='reading' and payload->>'version'='sensors-v1' and jsonb_typeof(payload->'answers')='array') or (payload->>'kind'='writing' and payload->>'version'='public-services-v1' and jsonb_typeof(payload->'text')='string')),
 check(jsonb_typeof(payload)='object'),
 check(octet_length(payload::text)<=150000)
);
-- No level or trusted score column: raw submissions are not evaluations.
create index plans_owner_date on public.study_plans(user_id,created_at desc);
create index activities_owner_date on public.study_activities(user_id,studied_on desc);
create index submissions_owner_date on public.diagnostic_submissions(user_id,created_at desc);
alter table public.study_plans enable row level security;
alter table public.study_activities enable row level security;
alter table public.diagnostic_submissions enable row level security;
create policy read_plans on public.study_plans for select to authenticated using(user_id=auth.uid());
create policy add_plans on public.study_plans for insert to authenticated with check(user_id=auth.uid());
create policy remove_plans on public.study_plans for delete to authenticated using(user_id=auth.uid());
create policy read_activities on public.study_activities for select to authenticated using(user_id=auth.uid());
create policy add_activities on public.study_activities for insert to authenticated with check(user_id=auth.uid());
create policy remove_activities on public.study_activities for delete to authenticated using(user_id=auth.uid());
create policy read_submissions on public.diagnostic_submissions for select to authenticated using(user_id=auth.uid());
create policy add_submissions on public.diagnostic_submissions for insert to authenticated with check(user_id=auth.uid());
create policy remove_submissions on public.diagnostic_submissions for delete to authenticated using(user_id=auth.uid());
revoke all on public.study_plans,public.study_activities,public.diagnostic_submissions from anon,authenticated;
grant select,insert,delete on public.study_plans,public.study_activities,public.diagnostic_submissions to authenticated;
