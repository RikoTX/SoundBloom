# Подписки SoundBloom

## SQL (обязательно)

В Supabase → **SQL Editor** выполните:

`backend/sql/add_subscriptions.sql`

Затем (карты для повторной оплаты):

`backend/sql/add_payment_methods.sql`

## Тарифы

| План | Пропуски | Реклама | Скачивание |
|------|----------|---------|------------|
| **free** | 3 в день | после 3-го пропуска — 30 сек | нет |
| **premium** | безлимит | нет | да (треки SoundBloom) |
| **family** | безлимит | нет | да + 6 аккаунтов (UI) |

## API

- `GET /api/subscription/status` — план, пропуски, флаги
- `POST /api/subscription/skip` — учёт пропуска, при необходимости `showAd` + `ad`
- `GET /api/subscription/payment-methods` — сохранённые карты (маска)
- `POST /api/subscription/checkout` — оплата с новой или сохранённой картой
- `POST /api/subscription/cancel` — отмена подписки (возврат на free)
- `GET /api/subscription/tracks/{id}/download` — ссылка на файл (Premium)

Пример checkout с новой картой (на сервер уходит только маска, не полный номер):

```json
{
  "plan": "premium",
  "months": 1,
  "saveCard": true,
  "newCard": {
    "cardholderName": "IVAN IVANOV",
    "lastFour": "4242",
    "brand": "visa",
    "expMonth": 12,
    "expYear": 28
  }
}
```

С сохранённой картой: `{ "plan": "premium", "paymentMethodId": "uuid" }`

## Просмотр в БД

**Table Editor → profiles:**

- `subscription_plan` — free | premium | family
- `subscription_expires_at` — конец месяца
- `skips_today` — сколько раз нажали «следующий трек»
- `skips_reset_date` — день сброса счётчика

**promo_ads** — тексты/картинки рекламы.

**subscription_payments** — история оплат (`payment_method_id` — какой картой).

**user_payment_methods** — привязанные карты: бренд, последние 4 цифры, срок, имя.

## Тест

1. Free: 3 раза «вперёд» в плеере без рекламы, 4-й — реклама 30 сек.
2. `/premium` → «Оплатить (демо)» → Premium → без рекламы, кнопка скачивания.
3. Скачивание только у треков `source: soundbloom`.
