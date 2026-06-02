-- Коды регистрации (отправка через SMTP backend, не Supabase)
-- Supabase → SQL Editor → Run

create table if not exists public.signup_verification_codes (
  email text primary key,
  code text not null,
  password text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.signup_verification_codes enable row level security;
