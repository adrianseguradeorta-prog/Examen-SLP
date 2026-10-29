create table public.error_patterns (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 pattern text not null check(length(pattern) between 3 and 160),
 pattern_key text not null,
 category text not null check(category in ('grammar','vocabulary','collocation','pronunciation','fluency','register','cohesion','argumentation','comprehension')),
 created_at timestamptz not null default now(),
 unique(user_id,id), unique(user_id,category,pattern_key)
);
create table public.error_observations (
 id uuid primary key,user_id uuid not null,
 pattern_id uuid not null,
 skill text not null check(skill in ('listening','speaking','reading','writing')),
 session_ref text not null check(length(session_ref) between 3 and 120),
 occurred_on date not null,
 outcome text not null check(outcome in ('error','correct')),
 example text not null check(length(example) between 3 and 2000),
 assisted boolean not null,
 created_at timestamptz not null default now(),
 foreign key(user_id,pattern_id) references public.error_patterns(user_id,id) on delete cascade
);
create index error_observations_owner on public.error_observations(user_id,pattern_id,occurred_on);
alter table public.error_patterns enable row level security;
alter table public.error_observations enable row level security;
create policy own_patterns on public.error_patterns for select to authenticated using(user_id=auth.uid());
create policy delete_patterns on public.error_patterns for delete to authenticated using(user_id=auth.uid());
create policy own_observations on public.error_observations for select to authenticated using(user_id=auth.uid());
create policy delete_observations on public.error_observations for delete to authenticated using(user_id=auth.uid());
revoke all on public.error_patterns,public.error_observations from anon,authenticated;
grant select,delete on public.error_patterns,public.error_observations to authenticated;
create function public.record_error_observation(event_id uuid,new_pattern_id uuid,pattern_text text,error_category text,event_skill text,session_label text,event_date date,event_outcome text,event_example text,event_assisted boolean)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); canonical text; selected_pattern uuid; existing public.error_observations;
begin
 if actor is null then raise exception 'Authentication required'; end if;
 canonical:=lower(regexp_replace(trim(pattern_text),'\s+',' ','g'));
 -- Serialize retries by event ID, so a lost response cannot duplicate an observation.
 perform pg_advisory_xact_lock(hashtextextended(event_id::text,0));
 select * into existing from public.error_observations where id=event_id;
 if existing.id is not null then
  if existing.user_id=actor and existing.skill=event_skill and existing.session_ref=trim(session_label) and existing.occurred_on=event_date and existing.outcome=event_outcome and existing.example=trim(event_example) and existing.assisted=event_assisted and exists(select 1 from public.error_patterns where id=existing.pattern_id and user_id=actor and pattern_key=canonical and category=error_category) then return existing.pattern_id; end if;
  raise exception 'Operation conflict' using errcode='23505';
 end if;
 if event_date>current_date+1 then raise exception 'Future observation not allowed'; end if;
 insert into public.error_patterns(id,user_id,pattern,pattern_key,category) values(new_pattern_id,actor,trim(pattern_text),canonical,error_category)
 on conflict(user_id,category,pattern_key) do update set pattern=public.error_patterns.pattern returning id into selected_pattern;
 if event_outcome='correct' and not exists(select 1 from public.error_observations where user_id=actor and pattern_id=selected_pattern and outcome='error') then raise exception 'Record an error before a successful opportunity'; end if;
 insert into public.error_observations(id,user_id,pattern_id,skill,session_ref,occurred_on,outcome,example,assisted) values(event_id,actor,selected_pattern,event_skill,trim(session_label),event_date,event_outcome,trim(event_example),event_assisted);
 return selected_pattern;
end;
$$;
revoke all on function public.record_error_observation(uuid,uuid,text,text,text,text,date,text,text,boolean) from public,anon;
grant execute on function public.record_error_observation(uuid,uuid,text,text,text,text,date,text,text,boolean) to authenticated;
