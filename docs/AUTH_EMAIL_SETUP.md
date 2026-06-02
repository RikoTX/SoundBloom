# Регистрация: email → код → никнейм

## Порядок шагов

1. Email + пароль → **Отправить**
2. Экран **кода** (6 цифр на почту)
3. После кода → **никнейм**
4. Главная

Код отправляет **ваш backend** через Gmail (не Supabase).

## Настройка (один раз)

### 1. SQL в Supabase

Выполните: `backend/sql/create_signup_verification_codes.sql`

### 2. Пароль Gmail в appsettings.local.json

```json
"Smtp": {
  "Host": "smtp.gmail.com",
  "Port": 587,
  "User": "ваш@gmail.com",
  "Password": "пароль-приложения-16-символов",
  "From": "ваш@gmail.com",
  "EnableSsl": true
}
```

Пароль приложения: Google Account → Security → 2-Step Verification → App passwords.

### 3. Перезапуск

`dotnet run` и `npm run dev`

## AutoConfirmEmail

Должно быть **false** (или отсутствовать), иначе код пропускается.
