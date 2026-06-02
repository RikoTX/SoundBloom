-- Подписки SoundBloom: выполнить в Supabase → SQL Editor

-- План: free | premium | family
-- subscription_expires_at — конец оплаченного периода (NULL = free навсегда)

alter table public.profiles
  add column if not exists subscription_plan text not null default 'free',
  add column if not exists subscription_expires_at timestamptz,
  add column if not exists skips_today integer not null default 0,
  add column if not exists skips_reset_date date not null default (current_date);

alter table public.profiles
  drop constraint if exists profiles_subscription_plan_check;

alter table public.profiles
  add constraint profiles_subscription_plan_check
  check (subscription_plan in ('free', 'premium', 'family'));

comment on column public.profiles.subscription_plan is 'free | premium | family';
comment on column public.profiles.subscription_expires_at is 'Окончание подписки (UTC); для free обычно NULL';
comment on column public.profiles.skips_today is 'Сколько раз нажали «следующий трек» сегодня (только free)';
comment on column public.profiles.skips_reset_date is 'Дата сброса счётчика пропусков';

-- История «оплат» (фейковая, для диплома)
create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check (plan in ('premium', 'family')),
  months integer not null default 1 check (months > 0 and months <= 24),
  amount_kzt integer not null default 0,
  paid_at timestamptz not null default now()
);

create index if not exists subscription_payments_user_id_idx
  on public.subscription_payments (user_id, paid_at desc);

alter table public.subscription_payments enable row level security;

-- Реклама для free после лимита пропусков
create table if not exists public.promo_ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  logo_url text,
  play_music boolean not null default false,
  music_url text,
  duration_seconds integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_ads enable row level security;

insert into public.promo_ads (title, body, image_url, logo_url, play_music, duration_seconds)
select
  'SoundBloom Premium',
  'Без рекламы, безлимитные пропуски и скачивание треков. Попробуй Premium!',
  null,
  '/SoundBloom/vite.svg',
  false,
  30
where not exists (select 1 from public.promo_ads limit 1);

insert into public.promo_ads (title, body, image_url, logo_url, play_music, duration_seconds)
select
  'Семейный тариф',
  'До 6 аккаунтов, семейные микс-плейлисты и все возможности Premium.',
  null,
  '/SoundBloom/vite.svg',
  false,
  30
where (select count(*) from public.promo_ads) < 2;

-- Просмотр подписок в Table Editor:
-- profiles: subscription_plan, subscription_expires_at, skips_today, skips_reset_date
