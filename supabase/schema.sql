-- =============================================================================
-- DripApp — paste into Supabase SQL Editor (or run via CLI). Safe to re-run.
-- Matches: lib/board-store.ts, lib/user-profile.ts, Auth (profiles on signup).
-- =============================================================================

-- UUID generation (Supabase often has this; harmless if already enabled)
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'My Board',
  sprite_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns if you already had an older boards table
alter table public.boards
  add column if not exists sprite_count int not null default 0;
alter table public.boards
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.board_sprites (
  id uuid primary key default gen_random_uuid (),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  image_url text not null,
  x double precision not null default 0,
  y double precision not null default 0,
  scale double precision not null default 1,
  rotation double precision not null default 0,
  z_index int not null default 0,
  width double precision,
  height double precision,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.board_sprites
  add column if not exists rotation double precision not null default 0;
alter table public.board_sprites
  add column if not exists width double precision;
alter table public.board_sprites
  add column if not exists height double precision;
alter table public.board_sprites
  add column if not exists is_hidden boolean not null default false;
alter table public.board_sprites
  add column if not exists updated_at timestamptz not null default now();

-- -----------------------------------------------------------------------------
-- updated_at on any row change
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $func$
begin
  new.updated_at = now();
  return new;
end;
$func$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at ();

drop trigger if exists boards_set_updated_at on public.boards;
create trigger boards_set_updated_at
before update on public.boards
for each row
execute function public.set_updated_at ();

drop trigger if exists board_sprites_set_updated_at on public.board_sprites;
create trigger board_sprites_set_updated_at
before update on public.board_sprites
for each row
execute function public.set_updated_at ();

-- Remove legacy trigger name if present
drop trigger if exists profiles_set_updated_at on public.profiles;
-- recreated above with set_updated_at

-- -----------------------------------------------------------------------------
-- Keep boards.sprite_count in sync with board_sprites rows
-- -----------------------------------------------------------------------------

create or replace function public.bump_board_sprite_count ()
returns trigger
language plpgsql
as $func$
begin
  if tg_op = 'INSERT' then
    update public.boards
    set
      sprite_count = sprite_count + 1
    where
      id = new.board_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.boards
    set
      sprite_count = greatest(sprite_count - 1, 0)
    where
      id = old.board_id;
    return old;
  elsif tg_op = 'UPDATE' then
    if old.board_id is distinct from new.board_id then
      update public.boards
      set
        sprite_count = greatest(sprite_count - 1, 0)
      where
        id = old.board_id;
      update public.boards
      set
        sprite_count = sprite_count + 1
      where
        id = new.board_id;
    end if;
    return new;
  end if;
  return null;
end;
$func$;

drop trigger if exists board_sprites_count_insert on public.board_sprites;
create trigger board_sprites_count_insert
after insert on public.board_sprites
for each row
execute function public.bump_board_sprite_count ();

drop trigger if exists board_sprites_count_delete on public.board_sprites;
create trigger board_sprites_count_delete
after delete on public.board_sprites
for each row
execute function public.bump_board_sprite_count ();

drop trigger if exists board_sprites_count_update on public.board_sprites;
create trigger board_sprites_count_update
after update on public.board_sprites
for each row
execute function public.bump_board_sprite_count ();

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_boards_user_created on public.boards (user_id, created_at desc);

create index if not exists idx_sprites_board_z on public.board_sprites (board_id, z_index asc, created_at asc);

create index if not exists idx_sprites_user_board on public.board_sprites (user_id, board_id);

create index if not exists idx_sprites_board_updated on public.board_sprites (board_id, updated_at desc);

-- -----------------------------------------------------------------------------
-- Row level security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;

alter table public.boards enable row level security;

alter table public.board_sprites enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;

drop policy if exists "profiles_insert_own" on public.profiles;

drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for
select
  to authenticated using (auth.uid () = id);

create policy "profiles_insert_own" on public.profiles for insert to authenticated
with
  check (auth.uid () = id);

create policy "profiles_update_own" on public.profiles
for update
to authenticated using (auth.uid () = id)
with
  check (auth.uid () = id);

-- Boards
drop policy if exists "boards_select_own" on public.boards;

drop policy if exists "boards_insert_own" on public.boards;

drop policy if exists "boards_update_own" on public.boards;

drop policy if exists "boards_delete_own" on public.boards;

create policy "boards_select_own" on public.boards for
select
  to authenticated using (auth.uid () = user_id);

create policy "boards_insert_own" on public.boards for insert to authenticated
with
  check (auth.uid () = user_id);

create policy "boards_update_own" on public.boards
for update
to authenticated using (auth.uid () = user_id)
with
  check (auth.uid () = user_id);

create policy "boards_delete_own" on public.boards for delete to authenticated using (auth.uid () = user_id);

-- Board sprites (app + legacy policy names)
drop policy if exists "board_sprites_select_own" on public.board_sprites;

drop policy if exists "board_sprites_insert_own" on public.board_sprites;

drop policy if exists "board_sprites_update_own" on public.board_sprites;

drop policy if exists "board_sprites_delete_own" on public.board_sprites;

drop policy if exists "sprites_select_own" on public.board_sprites;

drop policy if exists "sprites_insert_own" on public.board_sprites;

drop policy if exists "sprites_update_own" on public.board_sprites;

drop policy if exists "sprites_delete_own" on public.board_sprites;

create policy "board_sprites_select_own" on public.board_sprites for
select
  to authenticated using (
    auth.uid () = user_id
    and exists (
      select
        1
      from
        public.boards b
      where
        b.id = board_id
        and b.user_id = auth.uid ()
    )
  );

create policy "board_sprites_insert_own" on public.board_sprites for insert to authenticated
with
  check (
    auth.uid () = user_id
    and exists (
      select
        1
      from
        public.boards b
      where
        b.id = board_id
        and b.user_id = auth.uid ()
    )
  );

create policy "board_sprites_update_own" on public.board_sprites
for update
to authenticated using (
  auth.uid () = user_id
  and exists (
    select
      1
    from
      public.boards b
    where
      b.id = board_id
      and b.user_id = auth.uid ()
  )
)
with
  check (
    auth.uid () = user_id
    and exists (
      select
        1
      from
        public.boards b
      where
        b.id = board_id
          and b.user_id = auth.uid ()
    )
  );

create policy "board_sprites_delete_own" on public.board_sprites for delete to authenticated using (
  auth.uid () = user_id
  and exists (
    select
      1
    from
      public.boards b
    where
      b.id = board_id
      and b.user_id = auth.uid ()
  )
);

-- -----------------------------------------------------------------------------
-- New auth user → profile row (SECURITY DEFINER; works with email confirm off/on)
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, email, full_name, avatar_url)
    values (new.id, new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
      coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id)
    do update set
      email = coalesce(excluded.email, public.profiles.email),
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

drop trigger if exists auth_user_created_profile on auth.users;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

-- -----------------------------------------------------------------------------
-- Storage: public bucket "sprites" — app uploads to users/<user_id>/...
-- -----------------------------------------------------------------------------

insert into
  storage.buckets (id, name, public)
values
  ('sprites', 'sprites', true)
on conflict (id)
  do update set
    public = excluded.public;

drop policy if exists "sprites_public_read" on storage.objects;

drop policy if exists "sprites_insert_own_folder" on storage.objects;

drop policy if exists "sprites_update_own_folder" on storage.objects;

drop policy if exists "sprites_delete_own_folder" on storage.objects;

create policy "sprites_public_read" on storage.objects for
select
  using (bucket_id = 'sprites');

create policy "sprites_insert_own_folder" on storage.objects for insert to authenticated
with
  check (
    bucket_id = 'sprites'
    and (storage.foldername (name))[1] = 'users'
    and (storage.foldername (name))[2] = (select auth.uid ()::text)
  );

create policy "sprites_update_own_folder" on storage.objects
for update
to authenticated using (
  bucket_id = 'sprites'
  and (storage.foldername (name))[1] = 'users'
  and (storage.foldername (name))[2] = (select auth.uid ()::text)
)
with
  check (
    bucket_id = 'sprites'
    and (storage.foldername (name))[1] = 'users'
    and (storage.foldername (name))[2] = (select auth.uid ()::text)
  );

create policy "sprites_delete_own_folder" on storage.objects for delete to authenticated using (
  bucket_id = 'sprites'
  and (storage.foldername (name))[1] = 'users'
  and (storage.foldername (name))[2] = (select auth.uid ()::text)
);

-- Optional: drop old helper if you migrated from a previous schema.sql
drop function if exists public.handle_profiles_updated_at ();
