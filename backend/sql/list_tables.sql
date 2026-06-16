-- SoundBloom: список таблиц в Supabase (PostgreSQL)
-- Вставьте в Supabase → SQL Editor → Run

-- 1) Все таблицы схемы public (основные таблицы приложения)
select
  table_schema as schema,
  table_name as table_name,
  table_type
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

-- 2) Только количество (для карточки «N таблиц БД»)
select count(*) as table_count
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE';

-- 3) Нумерованный список + итог одной строкой
with app_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_type = 'BASE TABLE'
)
select row_number() over (order by table_name) as n, table_name
from app_tables
order by table_name;

-- 4) (опционально) Все схемы, не только public — auth, storage и т.д.
-- select table_schema, table_name
-- from information_schema.tables
-- where table_schema not in ('pg_catalog', 'information_schema')
--   and table_type = 'BASE TABLE'
-- order by table_schema, table_name;
