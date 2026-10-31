-- Preserve the supplied program's per-set prescriptions and independently log complex segments.
begin;
alter table public.set_logs add column if not exists segments jsonb not null default '[]'::jsonb check(jsonb_typeof(segments)='array' and jsonb_array_length(segments)<=30);
alter table public.nutrition_targets add column if not exists source jsonb check(source is null or jsonb_typeof(source)='object');
create or replace function public.validate_template() returns trigger language plpgsql set search_path='' as $$
declare e jsonb;r jsonb;p jsonb;has_source boolean;begin
 for e in select * from jsonb_array_elements(new.exercises) loop
 has_source:=jsonb_typeof(e->'source')='object';
 if not exists(select 1 from public.exercises where id=e->>'exercise_id') or
 coalesce((e->>'sets')::int,0) not between 1 and 10 or coalesce((e->>'reps')::int,0) not between 1 and 100 or
 coalesce((e->>'rest')::int,-1) not between 0 and 600 or ((e->>'rest')::int<15 and not coalesce(has_source,false)) then raise exception 'Invalid exercise prescription';end if;
 if coalesce(has_source,false) then
 if jsonb_typeof(e->'source'->'rows')<>'array' or jsonb_array_length(e->'source'->'rows')<>(e->>'sets')::int or coalesce((e->'source'->>'page')::int,0)<1 or coalesce(length(e->'source'->>'fileName'),0)=0 or coalesce((e->'source'->>'restMin')::int,0)<>(e->>'rest')::int then raise exception 'Invalid source prescription';end if;
 for r in select * from jsonb_array_elements(e->'source'->'rows') loop
 if coalesce(length(r->>'text'),0)=0 or jsonb_typeof(r->'segments')<>'array' or jsonb_array_length(r->'segments') not between 1 and 30 then raise exception 'Invalid source set';end if;
 end loop;
 end if;
 end loop;return new;end $$;
create function public.validate_logged_segments() returns trigger language plpgsql set search_path='' as $$declare s jsonb;begin
 for s in select * from jsonb_array_elements(new.segments) loop
 if coalesce(length(s->>'label'),0) not between 1 and 200 or coalesce((s->>'reps')::numeric,-1) not between 0 and 1000 or coalesce((s->>'weight')::numeric,-1) not between 0 and 1000 or coalesce(s->>'unit','') not in ('reps','seconds') or coalesce((s->>'multiplier')::int,0) not in (1,2) then raise exception 'Invalid logged segment';end if;
 end loop;return new;end $$;
create trigger validate_logged_segments before insert or update on public.set_logs for each row execute function public.validate_logged_segments();
create function public.import_source_templates(templates jsonb) returns integer language plpgsql security invoker set search_path='' as $$declare item jsonb;added integer:=0;count_added integer;begin
 if auth.uid() is null then raise exception 'Authentication required';end if;
 if jsonb_typeof(templates)<>'array' or jsonb_array_length(templates)>100 then raise exception 'Invalid template batch';end if;
 for item in select * from jsonb_array_elements(templates) loop
 if (item->>'user_id')::uuid is distinct from auth.uid() then raise exception 'Owner mismatch';end if;
 insert into public.workout_templates(id,user_id,name,split,exercises) values((item->>'id')::uuid,auth.uid(),item->>'name',item->>'split',item->'exercises') on conflict(id) do nothing;
 get diagnostics count_added=row_count;added:=added+count_added;
 end loop;return added;end $$;
revoke all on function public.import_source_templates(jsonb) from public;
grant execute on function public.import_source_templates(jsonb) to authenticated;
commit;
