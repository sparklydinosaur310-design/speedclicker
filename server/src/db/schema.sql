-- Player profile (one per login)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Saved game progress
create table public.game_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  speed bigint not null default 0,
  total_speed bigint not null default 0,
  click_level int not null default 1,
  treadmill_level int not null default 0,
  upgrades jsonb not null default '{}'::jsonb,
  last_saved_at timestamptz not null default now()
);

-- Items won from eggs
create table public.inventory (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null,
  biome text not null,
  rarity text not null,
  obtained_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Unlocked achievements
create table public.achievements (
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- Public leaderboard (the only table the browser can read)
create table public.leaderboard (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  username text not null,
  total_speed bigint not null default 0,
  updated_at timestamptz not null default now()
);
create index leaderboard_rank_idx on public.leaderboard (total_speed desc);

-- Lock everything down
alter table public.profiles enable row level security;
alter table public.game_state enable row level security;
alter table public.inventory enable row level security;
alter table public.achievements enable row level security;
alter table public.leaderboard enable row level security;

-- Your server (service role) can use all tables
grant all on all tables in schema public to service_role;

-- Anyone can READ the leaderboard, nobody can write it from the browser
grant select on public.leaderboard to anon, authenticated;
create policy "leaderboard is public"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

-- Turn on live updates for the leaderboard
alter publication supabase_realtime add table public.leaderboard;
