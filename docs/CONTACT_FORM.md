# Форма «Контакты» — как включить

## Вариант A — Web3Forms (проще всего)

1. Создайте файл `frontend/.env.local`:
   ```
   VITE_WEB3FORMS_ACCESS_KEY=ваш-ключ-с-web3forms.com
   VITE_API_URL=http://localhost:5223
   ```
2. **Перезапустите** frontend (`Ctrl+C` → `npm run dev`).
3. Письма смотрите в [Web3Forms → Submissions](https://web3forms.com).

## Вариант B — Supabase (без почты)

## Шаг 1 — SQL в Supabase (один раз)

1. Откройте [Supabase](https://supabase.com) → ваш проект → **SQL Editor**.
2. Скопируйте и выполните весь файл:  
   `backend/sql/create_contact_messages.sql`

## Шаг 2 — перезапуск backend

```bash
cd backend
dotnet run
```

У вас уже должен быть `appsettings.local.json` с `Supabase:Url`, `PublishableKey` и **`SecretKey`** (как для артистов и модерации).

## Проверка

1. Откройте сайт → **Контакты**.
2. Имя (2+ буквы), email, сообщение (10+ символов) → **Отправить**.
3. В Supabase → **Table Editor** → `contact_messages` — появится строка.

## Почта (необязательно)

Письма на Gmail только если добавите `Smtp` в `appsettings.local.json`. Без SMTP сообщения всё равно сохраняются в таблице.
