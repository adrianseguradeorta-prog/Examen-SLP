-- Prepared and tested locally only. No hosted service connected.
begin;
alter table public.diagnostic_submissions drop constraint diagnostic_kind_version;
alter table public.diagnostic_submissions add constraint diagnostic_kind_version check ((
 (payload->>'kind'='reading' and payload->>'version' in ('sensors-v1','training-time-v1','repair-cafe-v1') and jsonb_typeof(payload->'answers')='array') or
 (payload->>'kind'='writing' and payload->>'version' in ('public-services-v1','learning-budget-v1','shared-energy-v1') and jsonb_typeof(payload->'text')='string') or
 (payload->>'kind'='listening' and payload->>'version' in ('library-evenings-v1','energy-meeting-v1','mentoring-v1') and payload->>'mode'='practice' and jsonb_typeof(payload->'answers')='array') or
 (payload->>'kind'='speaking' and payload->>'version' in ('community-decision-v1','technology-decisions-v1','energy-resilience-v1','leadership-work-v1') and payload->>'completed'='true' and payload->>'audioRetained'='false')
) is true);
create table public.task_exposures (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 skill text not null check(skill in ('reading','writing','listening','speaking')),
 version text not null check(length(version) between 1 and 100),
 stage text not null check(stage in ('opened','solutions')),
 created_at timestamptz not null default now(),
 unique(user_id,skill,version,stage)
);
-- Exposure survives deletion of an attempt. It is not a score or a proficiency estimate.
alter table public.task_exposures enable row level security;
create policy read_exposures on public.task_exposures for select to authenticated using(user_id=auth.uid());
create policy add_exposures on public.task_exposures for insert to authenticated with check(user_id=auth.uid());
revoke all on public.task_exposures from anon,authenticated;
grant select,insert on public.task_exposures to authenticated;
commit;
