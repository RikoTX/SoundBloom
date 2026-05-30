create table if not exists public.liked_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  track_id text not null,
  source text not null check (source in ('jamendo', 'itunes')),
  title text not null,
  artist text,
  cover text,
  audio_url text not null,
  album text,
  created_at timestamptz not null default now(),
  unique (user_id, track_id, source)
);

create table if not exists public.saved_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  album_id text not null,
  title text not null,
  artist text,
  cover text,
  track_count integer,
  created_at timestamptz not null default now(),
  unique (user_id, album_id)
);

create table if not exists public.saved_genres (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tag text not null,
  label text not null,
  cover text,
  created_at timestamptz not null default now(),
  unique (user_id, tag)
);

create table if not exists public.saved_playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  playlist_id text not null,
  title text not null,
  cover text,
  user_name text,
  created_at timestamptz not null default now(),
  unique (user_id, playlist_id)
);

create index if not exists liked_tracks_user_id_idx on public.liked_tracks (user_id);
create index if not exists saved_albums_user_id_idx on public.saved_albums (user_id);
create index if not exists saved_genres_user_id_idx on public.saved_genres (user_id);
create index if not exists saved_playlists_user_id_idx on public.saved_playlists (user_id);

alter table public.liked_tracks enable row level security;
alter table public.saved_albums enable row level security;
alter table public.saved_genres enable row level security;
alter table public.saved_playlists enable row level security;
