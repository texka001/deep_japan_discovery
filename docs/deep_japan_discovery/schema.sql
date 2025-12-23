-- Enable PostGIS for location features
create extension if not exists "postgis";

-- Users Table
-- Managed by Supabase Auth, but we can extend it if needed or just reference auth.users
create table public.users (
  user_id uuid not null references auth.users on delete cascade,
  subscription_status text check (subscription_status in ('Free', 'Pro')) default 'Free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id)
);

-- RLS for Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = user_id);
create policy "Users can update their own profile" on public.users for update using (auth.uid() = user_id);

-- Spots Table
create table public.spots (
  spot_id uuid default gen_random_uuid() primary key,
  name_en text not null,
  name_jp text not null,
  location geography(Point, 4326) not null,
  category text check (category in ('Subculture', 'Retro', 'Craft')) not null,
  difficulty int check (difficulty between 1 and 3) default 1,
  avg_stay_minutes int default 60,
  deep_guide_json jsonb, -- Pro content: instructions, rules, cards
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Spots
alter table public.spots enable row level security;
create policy "Public spots are viewable by everyone" on public.spots for select using (true);
-- Only admins/service role can insert/update (omitted for now)

-- Journeys Table
create table public.journeys (
  journey_id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(user_id) on delete cascade not null,
  title text,
  route_json jsonb not null, -- Stores the timeline/stops
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Journeys
alter table public.journeys enable row level security;
create policy "Users can view their own journeys" on public.journeys for select using (auth.uid() = user_id);
create policy "Users can create their own journeys" on public.journeys for insert with check (auth.uid() = user_id);
create policy "Users can update their own journeys" on public.journeys for update using (auth.uid() = user_id);
create policy "Users can delete their own journeys" on public.journeys for delete using (auth.uid() = user_id);
