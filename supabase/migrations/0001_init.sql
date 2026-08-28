-- =============================================================================
-- Pinly — initial schema
-- =============================================================================

-- ---------- PROFILES ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- ---------- BOARDS -----------------------------------------------------------
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_private boolean default false,
  created_at timestamptz default now()
);

-- ---------- PINS -------------------------------------------------------------
create table if not exists public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  board_id uuid references public.boards(id) on delete set null,
  title text,
  description text,
  link text,
  image_path text not null,          -- storage object path
  image_url text not null,           -- public URL
  width int not null,                -- intrinsic px, for layout stability
  height int not null,
  created_at timestamptz default now()
);

create index if not exists pins_created_at_idx on public.pins (created_at desc);
create index if not exists pins_user_id_idx    on public.pins (user_id);
create index if not exists pins_board_id_idx   on public.pins (board_id);

-- ---------- SAVES ------------------------------------------------------------
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pin_id uuid not null references public.pins(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, pin_id, board_id)
);

create index if not exists saves_board_id_idx on public.saves (board_id);
create index if not exists saves_user_id_idx  on public.saves (user_id);

-- ---------- COMMENTS ---------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  pin_id uuid not null references public.pins(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create index if not exists comments_pin_id_idx on public.comments (pin_id, created_at);

-- ---------- FOLLOWS ----------------------------------------------------------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists follows_following_id_idx on public.follows (following_id);

-- ---------- SEARCH -----------------------------------------------------------
-- Trigram index so ilike '%term%' on title/description stays fast.
create extension if not exists pg_trgm;
create index if not exists pins_title_trgm_idx
  on public.pins using gin (title gin_trgm_ops);
create index if not exists pins_description_trgm_idx
  on public.pins using gin (description gin_trgm_ops);

-- ---------- AUTO-CREATE A PROFILE ON SIGNUP ----------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.boards   enable row level security;
alter table public.pins     enable row level security;
alter table public.saves    enable row level security;
alter table public.comments enable row level security;
alter table public.follows  enable row level security;

-- Profiles: world-readable, self-writable
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
create policy "profiles update" on public.profiles for update using (auth.uid() = id);

-- Boards: public ones visible to all, private only to owner
drop policy if exists "boards read"   on public.boards;
drop policy if exists "boards insert" on public.boards;
drop policy if exists "boards update" on public.boards;
drop policy if exists "boards delete" on public.boards;
create policy "boards read"   on public.boards for select
  using (not is_private or auth.uid() = user_id);
create policy "boards insert" on public.boards for insert with check (auth.uid() = user_id);
create policy "boards update" on public.boards for update using (auth.uid() = user_id);
create policy "boards delete" on public.boards for delete using (auth.uid() = user_id);

-- Pins
drop policy if exists "pins read"   on public.pins;
drop policy if exists "pins insert" on public.pins;
drop policy if exists "pins update" on public.pins;
drop policy if exists "pins delete" on public.pins;
create policy "pins read"   on public.pins for select using (true);
create policy "pins insert" on public.pins for insert with check (auth.uid() = user_id);
create policy "pins update" on public.pins for update using (auth.uid() = user_id);
create policy "pins delete" on public.pins for delete using (auth.uid() = user_id);

-- Saves
drop policy if exists "saves read"   on public.saves;
drop policy if exists "saves insert" on public.saves;
drop policy if exists "saves delete" on public.saves;
create policy "saves read"   on public.saves for select using (true);
create policy "saves insert" on public.saves for insert with check (auth.uid() = user_id);
create policy "saves delete" on public.saves for delete using (auth.uid() = user_id);

-- Comments
drop policy if exists "comments read"   on public.comments;
drop policy if exists "comments insert" on public.comments;
drop policy if exists "comments delete" on public.comments;
create policy "comments read"   on public.comments for select using (true);
create policy "comments insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments delete" on public.comments for delete using (auth.uid() = user_id);

-- Follows
drop policy if exists "follows read"   on public.follows;
drop policy if exists "follows insert" on public.follows;
drop policy if exists "follows delete" on public.follows;
create policy "follows read"   on public.follows for select using (true);
create policy "follows insert" on public.follows for insert with check (auth.uid() = follower_id);
create policy "follows delete" on public.follows for delete using (auth.uid() = follower_id);
