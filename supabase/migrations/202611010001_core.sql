-- LÉMAQQUE core. Run with Supabase migrations or SQL Editor as project owner.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 user_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null check(length(name) between 1 and 80),
 age int not null check(age between 18 and 100), height numeric not null check(height between 100 and 250),
 weight numeric not null check(weight between 30 and 400),target_weight numeric not null check(target_weight between 30 and 400),
 goal text not null check(goal in ('Muscle building','Fat loss','Body recomposition','Strength','General fitness','Maintenance')),
 experience text not null check(experience in ('Beginner','Intermediate','Advanced')),
 days int[] not null check(cardinality(days) between 1 and 7 and days <@ array[0,1,2,3,4,5,6]),
 duration int not null check(duration between 15 and 180),equipment text not null check(equipment in ('Gym','Dumbbells','Bodyweight')),
 restrictions text not null default '' check(length(restrictions)<=1000), timezone text not null default 'Asia/Kuala_Lumpur',
 quality text not null default 'auto' check(quality in ('auto','static')),check(id=user_id)
);
create table public.muscle_groups(id text primary key,name text not null unique,function text not null default '');
create table public.exercises(id text primary key,name text not null,muscle_id text references public.muscle_groups(id),equipment text not null,content jsonb not null default '{}',review_status text not null default 'draft' check(review_status in ('draft','approved','rejected')));
create table public.workout_templates(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null check(length(name) between 1 and 100),split text not null,exercises jsonb not null check(jsonb_typeof(exercises)='array' and jsonb_array_length(exercises) between 1 and 20),unique(id,user_id));
create table public.workout_exercises(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,template_id uuid not null,exercise_id text not null references public.exercises(id),position int not null check(position>=0),sets int not null check(sets between 1 and 10),reps int not null check(reps between 1 and 100),rest int not null check(rest between 15 and 600),foreign key(template_id,user_id) references public.workout_templates(id,user_id) on delete cascade,unique(template_id,position));
create table public.workout_sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,template_id uuid,name text not null check(length(name) between 1 and 100),exercises jsonb not null default '[]' check(jsonb_typeof(exercises)='array'),started_at timestamptz not null default now(),finished_at timestamptz,paused_at timestamptz,paused_ms bigint not null default 0 check(paused_ms>=0),status text not null check(status in ('active','completed','discarded')),unique(id,user_id),foreign key(template_id,user_id) references public.workout_templates(id,user_id) on delete set null (template_id),check(finished_at is null or finished_at>=started_at),check(paused_at is null or paused_at>=started_at),check((status='active' and finished_at is null) or (status<>'active' and finished_at is not null)));
create unique index one_active_session_per_user on public.workout_sessions(user_id) where status='active';
create table public.set_logs(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,session_id uuid not null,exercise_id text not null references public.exercises(id),set_number int not null check(set_number between 1 and 10),reps int not null check(reps between 0 and 500),weight numeric not null check(weight between 0 and 1000),rpe numeric not null check(rpe between 1 and 10),completed boolean not null default false,foreign key(session_id,user_id) references public.workout_sessions(id,user_id) on delete cascade,unique(session_id,exercise_id,set_number));
create table public.attendance_records(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,day date not null,status text not null check(status in ('completed','partial','rest')),notes text not null default '' check(length(notes)<=1000),unique(user_id,day));
create table public.scheduled_workouts(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,template_id uuid,day date not null,status text not null default 'planned' check(status in ('planned','completed','partial','rest','missed')),notes text not null default '' check(length(notes)<=1000),foreign key(template_id,user_id) references public.workout_templates(id,user_id) on delete set null (template_id));
create table public.food_items(id uuid primary key default gen_random_uuid(),name text not null,source_url text,source_reference text not null,review_status text not null default 'draft' check(review_status in ('draft','approved','rejected')));
create table public.food_servings(id uuid primary key default gen_random_uuid(),food_id uuid not null references public.food_items(id) on delete cascade,description text not null,grams numeric not null check(grams>0),calories numeric not null check(calories>=0),protein numeric not null check(protein>=0),carbs numeric not null check(carbs>=0),fat numeric not null check(fat>=0));
create table public.meal_entries(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,day date not null,name text not null check(length(name) between 1 and 120),meal text not null check(meal in ('Breakfast','Lunch','Dinner','Snack')),quantity numeric not null check(quantity>0 and quantity<=100),unit text not null check(length(unit) between 1 and 50),calories numeric not null check(calories between 0 and 5000),protein numeric not null check(protein between 0 and 500),carbs numeric not null check(carbs between 0 and 1000),fat numeric not null check(fat between 0 and 500),source text not null check(length(source) between 3 and 500));
create table public.nutrition_targets(id uuid primary key references auth.users(id) on delete cascade,user_id uuid not null unique references auth.users(id) on delete cascade,calories numeric not null check(calories between 1200 and 6000),protein numeric not null check(protein between 20 and 400),carbs numeric not null check(carbs between 20 and 1000),fat numeric not null check(fat between 20 and 300),water_ml int not null check(water_ml between 500 and 6000),check(id=user_id));
create table public.water_entries(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,day date not null,ml int not null check(ml between 1 and 3000));
create table public.body_measurements(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,day date not null,weight numeric not null check(weight between 30 and 400),waist numeric check(waist between 20 and 300),chest numeric check(chest between 20 and 300),hips numeric check(hips between 20 and 300));
create table public.recipes(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,name text not null,ingredients jsonb not null,servings numeric not null check(servings>0));
create table public.progress_photos(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,day date not null,object_path text not null check(split_part(object_path,'/',1)=user_id::text),notes text not null default '');
create table public.achievements(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,code text not null,earned_at timestamptz not null default now(),unique(user_id,code));
create table public.recommendations(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,explanation text not null,proposal jsonb not null,status text not null default 'pending' check(status in ('pending','accepted','rejected')));
create table public.user_settings(id uuid primary key references auth.users(id) on delete cascade,user_id uuid not null unique references auth.users(id) on delete cascade,preferences jsonb not null default '{}',check(id=user_id));
create table public.model_assets(id uuid primary key default gen_random_uuid(),url text not null check(url like 'https://%' or (url like '/%' and url not like '//%')),source_url text not null check(source_url like 'https://%'),license text not null check(length(license)>0),attribution text not null,review_status text not null default 'draft' check(review_status in ('draft','approved','rejected')),region_map jsonb not null default '{}');
create table public.exercise_animation_assets(id uuid primary key default gen_random_uuid(),exercise_id text not null references public.exercises(id),model_id uuid not null references public.model_assets(id),clip_name text not null,review_status text not null default 'draft' check(review_status in ('draft','approved','rejected')),reviewed_by text,reviewed_at timestamptz,check(review_status<>'approved' or (length(reviewed_by)>0 and reviewed_at is not null)));
create table public.curated_program_references(id uuid primary key default gen_random_uuid(),title text not null,source_url text not null,explanation text not null,review_status text not null default 'draft' check(review_status in ('draft','approved','rejected')));

create or replace function public.is_catalog_admin() returns boolean language sql stable set search_path='' as $$select coalesce(auth.jwt()->'app_metadata'->>'role'='admin',false)$$;
-- Never use user_metadata for authorization: users can edit it.
do $$declare t text;begin
 foreach t in array array['profiles','workout_templates','workout_exercises','workout_sessions','set_logs','attendance_records','scheduled_workouts','meal_entries','nutrition_targets','water_entries','body_measurements','recipes','progress_photos','achievements','recommendations','user_settings'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy owner_access on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
 execute format('create index %I on public.%I(user_id)',t||'_owner_idx',t);
 execute format('grant select,insert,update,delete on public.%I to authenticated',t);
 end loop;
 foreach t in array array['muscle_groups','exercises','food_items','food_servings','model_assets','exercise_animation_assets','curated_program_references'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy admin_write on public.%I for all to authenticated using (public.is_catalog_admin()) with check (public.is_catalog_admin())',t);
 execute format('grant select on public.%I to anon, authenticated',t);
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 end loop;
end $$;
create policy directory_read on public.muscle_groups for select to anon,authenticated using(true);
create policy approved_read on public.exercises for select to anon,authenticated using(review_status='approved');
create policy approved_read on public.food_items for select to anon,authenticated using(review_status='approved');
create policy approved_read on public.food_servings for select to anon,authenticated using(exists(select 1 from public.food_items f where f.id=food_id and f.review_status='approved'));
create policy approved_read on public.model_assets for select to anon,authenticated using(review_status='approved');
create policy approved_read on public.exercise_animation_assets for select to anon,authenticated using(review_status='approved' and exists(select 1 from public.model_assets m where m.id=model_id and m.review_status='approved'));
create policy approved_read on public.curated_program_references for select to anon,authenticated using(review_status='approved');
create index logs_session on public.set_logs(session_id);
create index meals_owner_day on public.meal_entries(user_id,day);
create index schedule_owner_day on public.scheduled_workouts(user_id,day);
create index measurements_owner_day on public.body_measurements(user_id,day);

-- Validate each nested prescription, not merely its JSON shape.
create function public.validate_template() returns trigger language plpgsql set search_path='' as $$declare e jsonb;begin
 for e in select * from jsonb_array_elements(new.exercises) loop
 if not exists(select 1 from public.exercises where id=e->>'exercise_id') or
 coalesce((e->>'sets')::int,0) not between 1 and 10 or coalesce((e->>'reps')::int,0) not between 1 and 100 or coalesce((e->>'rest')::int,0) not between 15 and 600 then raise exception 'Invalid exercise prescription'; end if;
 end loop;return new;end $$;
create trigger validate_template before insert or update on public.workout_templates for each row execute function public.validate_template();
-- Finish, attendance and scheduled status are one transaction; caller RLS stays active.
create function public.finish_workout(session_id uuid,day date) returns void language plpgsql security invoker set search_path='' as $$declare s public.workout_sessions;stamp timestamptz:=now();begin
 select * into s from public.workout_sessions where id=session_id and user_id=auth.uid() for update;
 if not found then raise exception 'Session not found';end if;
 if s.status='discarded' then raise exception 'Session was discarded';end if;
 if not exists(select 1 from public.set_logs l where l.session_id=s.id and completed) then raise exception 'Complete at least one set';end if;
 update public.workout_sessions set status='completed',finished_at=coalesce(finished_at,stamp),paused_ms=paused_ms+case when paused_at is null then 0 else (extract(epoch from stamp-paused_at)*1000)::bigint end,paused_at=null where id=s.id;
 insert into public.attendance_records(user_id,day,status,notes) values(auth.uid(),$2,'completed','Workout completed.') on conflict on constraint attendance_records_user_id_day_key do update set status='completed';
 update public.scheduled_workouts set status='completed' where user_id=auth.uid() and scheduled_workouts.day=$2 and template_id=s.template_id;
 end $$;
revoke all on function public.finish_workout(uuid,date) from public;
grant execute on function public.finish_workout(uuid,date) to authenticated;
commit;
