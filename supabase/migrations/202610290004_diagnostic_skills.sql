-- Prepared only; no cloud connection. Preserve immutable rows and owner RLS.
begin;
do $$
declare constraint_row record;
begin
  for constraint_row in
    select conname from pg_constraint
    where conrelid = 'public.diagnostic_submissions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%payload ->> ''kind''%'
  loop
    execute format('alter table public.diagnostic_submissions drop constraint %I', constraint_row.conname);
  end loop;
end $$;
alter table public.diagnostic_submissions add constraint diagnostic_kind_version check ((
  (payload->>'kind'='reading' and payload->>'version'='sensors-v1' and jsonb_typeof(payload->'answers')='array') or
  (payload->>'kind'='writing' and payload->>'version'='public-services-v1' and jsonb_typeof(payload->'text')='string') or
  (payload->>'kind'='listening' and payload->>'version'='library-evenings-v1' and payload->>'mode'='practice' and jsonb_typeof(payload->'answers')='array') or
  (payload->>'kind'='speaking' and payload->>'version'='community-decision-v1' and payload->>'completed'='true' and payload->>'audioRetained'='false')
) is true);
alter table public.diagnostic_submissions add constraint diagnostic_no_audio check (
  not (payload ?| array['audio','audioUrl','audioBlob','audioBase64'])
);
commit;
