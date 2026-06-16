-- Семейный доступ SoundBloom: выполнить в Supabase → SQL Editor
-- после add_subscriptions.sql (тариф family)

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  member_username text not null,
  added_at timestamptz not null default now(),
  unique (member_id)
);

create index if not exists family_members_owner_idx
  on public.family_members (owner_id, added_at desc);

alter table public.family_members enable row level security;

comment on table public.family_members is 'Участники семейной подписки (до 6 человек, владелец — owner_id)';
