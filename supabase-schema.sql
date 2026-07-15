create table teams (
  id text primary key,
  name text not null
);

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  team_id text references teams(id),
  position text default 'QB'
);

create table games (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  team_id text references teams(id),
  opponent_id text references teams(id),
  season integer not null,
  week integer not null,
  game_date date,
  result text,
  score text,
  unique(player_id, season, week)
);

create table profiles (
  id uuid primary key references auth.users(id),
  username text unique
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  game_id uuid references games(id),
  stars numeric(2,1) check (stars >= 0.5 and stars <= 5),
  review_text text,
  created_at timestamp default now(),
  unique(user_id, game_id)
);

alter table ratings enable row level security;

create policy "Anyone can read ratings" on ratings
  for select using (true);

create policy "Users can insert their own ratings" on ratings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own ratings" on ratings
  for update using (auth.uid() = user_id);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
