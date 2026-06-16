-- Промокоды SoundBloom: выполнить в Supabase → SQL Editor
-- после add_subscriptions.sql

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed', 'free_months')),
  discount_value numeric(12, 2) not null default 0,
  applies_to text not null default 'all' check (applies_to in ('all', 'premium', 'family')),
  max_redemptions integer,
  redeemed_count integer not null default 0,
  per_user_limit integer not null default 1,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists promo_codes_code_idx on public.promo_codes (code);
create index if not exists promo_codes_active_idx on public.promo_codes (is_active, expires_at);

alter table public.promo_codes enable row level security;

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  promo_id uuid not null references public.promo_codes(id) on delete cascade,
  promo_code text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('premium', 'family')),
  discount_type text not null,
  discount_value numeric(12, 2) not null,
  amount_before integer not null,
  amount_after integer not null,
  redeemed_at timestamptz not null default now(),
  unique (promo_id, user_id)
);

create index if not exists promo_redemptions_user_idx
  on public.promo_redemptions (user_id, redeemed_at desc);

alter table public.promo_redemptions enable row level security;

comment on table public.promo_codes is 'Скидочные промокоды на подписку (admin)';
comment on table public.promo_redemptions is 'История активаций промокодов (один раз на пользователя)';
