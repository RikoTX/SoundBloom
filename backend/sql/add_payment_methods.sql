-- Привязанные карты (демо): только маска, без полного номера и CVV.
-- Выполнить в Supabase после add_subscriptions.sql

create table if not exists public.user_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_brand text not null default 'unknown',
  last_four text not null check (char_length(last_four) = 4),
  exp_month smallint not null check (exp_month between 1 and 12),
  exp_year smallint not null check (exp_year >= 0 and exp_year <= 99),
  cardholder_name text not null,
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists user_payment_methods_user_id_idx
  on public.user_payment_methods (user_id, is_default desc, created_at desc);

create unique index if not exists user_payment_methods_user_card_uidx
  on public.user_payment_methods (user_id, last_four, exp_month, exp_year);

alter table public.user_payment_methods enable row level security;

alter table public.subscription_payments
  add column if not exists payment_method_id uuid references public.user_payment_methods(id) on delete set null;

comment on table public.user_payment_methods is 'Сохранённые карты пользователя (маска для повторной оплаты, дипломный демо-проект)';
