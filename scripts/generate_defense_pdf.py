# -*- coding: utf-8 -*-
"""
SoundBloom defense PDF — строго по секциям landing page (App.tsx + content.ts ru).
"""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer

PDF_PATH = Path.home() / "Desktop" / "SoundBloom_Описание_проекта.pdf"

# Точная структура landing page (landingPage/src/App.tsx + content.ts ru)
SECTIONS = [
    {
        "id": "hero",
        "nav": "— (старт, без пункта меню)",
        "label": "Hero · Звук в цвету",
        "on_screen": [
            "Дипломный проект · SoundBloom",
            "Звук / в цвету",
            "Музыкальная стриминговая платформа «SoundBloom». Клиентская часть (Frontend) · Серверная часть (Backend).",
            "Кнопки: «Открыть SoundBloom» · «О проекте»",
        ],
        "say": (
            "Здравствуйте. Меня зовут Кокиш Амир Арманулы, группа П-23-62Б. "
            "Тема дипломного проекта — музыкальная стриминговая платформа SoundBloom. "
            "Это full-stack разработка: frontend на React и backend на ASP.NET Core."
        ),
        "time": "~30 сек",
    },
    {
        "id": "about",
        "nav": "О проекте",
        "label": "01 · Цель и задачи",
        "on_screen": [
            "Заголовок: Спроектировать и реализовать full-stack платформу «SoundBloom»",
            "Цель — стриминговый frontend с библиотекой и artist studio, backend на .NET с каталогом, подписками и модерацией.",
            "Актуальность: lossless-звук, умный каталог, студия артиста, локализация ru/kk/en.",
            "Крупно: «Цель достигнута: платформа развёрнута и работает.»",
        ],
        "say": (
            "Цель проекта — спроектировать и реализовать full-stack платформу SoundBloom. "
            "Frontend — стриминг, библиотека и artist studio. Backend на .NET — каталог, подписки и модерация. "
            "Актуальность: lossless, умный каталог, студия для артистов и три языка — ru, kk, en. "
            "Цель достигнута: платформа развёрнута и работает."
        ),
        "time": "~1 мин",
    },
    {
        "id": "problem",
        "nav": "Проблема",
        "label": "02 · Проблема и актуальность",
        "on_screen": [
            "Заголовок: Почему современному стримингу не хватает «живого» звука",
            "Блок «Шум»:",
            "  • Прерывания и сжатый звук рвут момент",
            "  • Артистам сложно публиковать и анализировать треки",
            "  • Нужны поиск, три языка на любом устройстве",
            "  • Нет единой платформы для слушателя и артиста",
            "При скролле → блок «Расцвет»:",
            "  • Lossless, Premium и Family без рекламы",
            "  • Artist Studio: загрузка, модерация, аналитика",
            "  • Full-stack: React + .NET + Supabase",
        ],
        "say": (
            "Сначала на экране блок «Шум» — проблемы. Прерывания и сжатый звук. "
            "Артистам сложно публиковать и смотреть аналитику. "
            "Пользователям нужны поиск, три языка и единый опыт. "
            "Нет одной платформы и для слушателя, и для артиста. "
            "При прокрутке появляется «Расцвет» — моё решение: Premium и Family без рекламы, "
            "Artist Studio с модерацией, full-stack на React, .NET и Supabase."
        ),
        "time": "~1 мин",
        "note": "На landing page здесь анимация: при скролле «Шум» сменяется «Расцветом» и эквалайзер «расцветает».",
    },
    {
        "id": "showcase",
        "nav": "Платформа",
        "label": "03 · Сквозной путь",
        "on_screen": [
            "Заголовок: Как устроена платформа целиком",
            "Подзаголовок: От браузера до базы данных — один продуктовый сценарий.",
            "01 React + Vite — Каталог, плеер, библиотека, artist studio, Premium, локализация ru/kk/en.",
            "02 ASP.NET Core API — Каталог и стриминг, библиотека, подписки, промокоды, admin/operator панели.",
            "03 Supabase — PostgreSQL, Auth, Storage — единый backend для данных и авторизации.",
        ],
        "say": (
            "Секция «Платформа» — сквозной путь. От браузера до базы данных один сценарий. "
            "Первый слой — React и Vite: каталог, плеер, библиотека, artist studio, Premium, три языка. "
            "Второй — ASP.NET Core API: стриминг, библиотека, подписки, промокоды, панели admin и operator. "
            "Третий — Supabase: PostgreSQL, Auth и Storage для данных и файлов."
        ),
        "time": "~1 мин",
        "note": "Слева на экране — анимированный плеер, шаги переключаются при скролле.",
    },
    {
        "id": "features",
        "nav": "Возможности",
        "label": "04 · Клиентский опыт",
        "on_screen": [
            "Заголовок: Интерфейс, плеер и каталог",
            "01 Музыкальный плеер — стриминг, очередь, лайки, превью Jamendo и iTunes рядом с треками артистов.",
            "02 Библиотека и поиск — плейлисты, альбомы, жанры, сохранённые треки — всё привязано к аккаунту.",
            "03 Локализация ru / kk / en — полный перевод интерфейса.",
            "04 Artist Studio — регистрация артиста, загрузка треков, модерация, аналитика прослушиваний.",
            "05 Premium и Family — lossless, офлайн-скачивание, без рекламы, семейный тариф и промокоды.",
            "06 Светлая и тёмная тема.",
            "Цифры: 71 API · 3 языка · 24 таблицы · 2 роли модерации",
        ],
        "say": (
            "Шесть блоков клиентского опыта. Плеер — стриминг, очередь, Jamendo, iTunes и треки артистов. "
            "Библиотека — всё в аккаунте. Три языка: ru, kk, en. "
            "Artist Studio — загрузка, модерация, аналитика. Premium и Family — lossless, офлайн, промокоды. "
            "Внизу цифры: 71 API-эндпоинт, 3 языка, 24 таблицы, 2 роли модерации."
        ),
        "time": "~1,5 мин",
        "note": "Здесь можно перейти в живое приложение и показать demo.",
    },
    {
        "id": "finale",
        "nav": "— (финал при скролле)",
        "label": "Заключение",
        "on_screen": [
            "Заключение",
            "Спасибо / за внимание",
            "Backend: ASP.NET Core. Frontend: React + Vite. Система развёрнута и готова к демонстрации.",
            "Кокиш Амир Арманулы · группа П-23-62Б",
            "Кнопка: Открыть SoundBloom",
        ],
        "say": (
            "В заключении: backend на ASP.NET Core, frontend на React и Vite. "
            "Система развёрнута и готова к демонстрации. Спасибо за внимание — готов ответить на вопросы "
            "и показать приложение."
        ),
        "time": "~30 сек",
    },
]

QA = [
    ("A. По landing page и проекту", [
        ("Сколько секций на landing page?", "Шесть: Hero, О проекте, Проблема, Платформа, Возможности, Заключение. В меню четыре якоря: О проекте, Проблема, Платформа, Возможности."),
        ("Что на секции «Проблема»?", "Два состояния: «Шум» — 4 проблемы стриминга; при скролле «Расцвет» — 3 решения SoundBloom."),
        ("Что показывает секция «Платформа»?", "Три шага: React+Vite → ASP.NET Core → Supabase. С анимированным плеером слева."),
        ("Какие цифры на секции «Возможности»?", "71 API эндпоинт, 3 языка (EN·RU·KK), 24 таблицы в БД, 2 роли модерации."),
    ]),
    ("B. Функционал приложения", [
        ("О чём проект?", "SoundBloom — стриминг + библиотека + Artist Studio + подписки + модерация. Jamendo/iTunes для discovery, свои треки артистов через backend."),
        ("Чем отличается от Spotify?", "Артист сам загружает треки; слушатель и артист в одном продукте; ru/kk/en; модерация; свой full-stack."),
        ("Как работает загрузка трека?", "Artist Studio → upload → moderation pending → operator/admin approve → трек в каталоге."),
        ("Какие роли?", "user, artist, operator, admin."),
    ]),
    ("C. React (frontend)", [
        ("Почему React?", "Компонентный UI: плеер, библиотека, header переиспользуются. SPA без перезагрузки."),
        ("Как frontend ходит в API?", "fetch + JWT в Authorization. Например libraryApi.js, artistApi.js."),
        ("Как локализация?", "i18next, bundledTranslations.js, переключатель языка в header."),
        ("Что на landing page технически?", "React + Vite + Framer Motion + GSAP + Three.js (фон). Smooth scroll между секциями."),
    ]),
    ("D. Backend и БД", [
        ("Почему ASP.NET Core?", "REST API, JWT, Endpoints + Services, типизация C#."),
        ("Почему Supabase?", "PostgreSQL + Auth + Storage в одном сервисе."),
        ("Сколько модулей backend?", "10: Auth, Catalog, Library, Artist, Subscription, Promo, Admin, Operator, I18n, Contact."),
    ]),
    ("E. Дизайн — могут спросить", [
        ("Почему тёмная тема?", "Стандарт для музыкальных сервисов, меньше нагрузка на глаза. Есть светлая тема в приложении."),
        ("Landing vs приложение?", "Landing — презентационный сайт для защиты. Само приложение SoundBloom — отдельный frontend с плеером и библиотекой."),
    ]),
]


def esc(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_styles():
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Italic", r"C:\Windows\Fonts\ariali.ttf"))
    return {
        "title": ParagraphStyle("title", fontName="Arial-Bold", fontSize=17, leading=22, alignment=TA_CENTER, spaceAfter=10, textColor=colors.HexColor("#1E3A5F")),
        "part": ParagraphStyle("part", fontName="Arial-Bold", fontSize=13, leading=18, spaceBefore=14, spaceAfter=8, textColor=colors.white, backColor=colors.HexColor("#1E3A5F"), borderPadding=(7, 7, 7, 7)),
        "sec": ParagraphStyle("sec", fontName="Arial-Bold", fontSize=11.5, leading=15, spaceBefore=10, spaceAfter=4, textColor=colors.HexColor("#EE10B0")),
        "meta": ParagraphStyle("meta", fontName="Arial", fontSize=9, leading=12, spaceAfter=3, textColor=colors.HexColor("#666666")),
        "screen": ParagraphStyle("screen", fontName="Arial", fontSize=9.5, leading=13, spaceAfter=2, leftIndent=10, textColor=colors.HexColor("#333333")),
        "say": ParagraphStyle("say", fontName="Arial-Italic", fontSize=10, leading=14, spaceAfter=6, leftIndent=10, textColor=colors.HexColor("#1E3A5F")),
        "note": ParagraphStyle("note", fontName="Arial", fontSize=9, leading=12, spaceAfter=6, leftIndent=10, textColor=colors.HexColor("#0E9EEF")),
        "body": ParagraphStyle("body", fontName="Arial", fontSize=10, leading=14, spaceAfter=5),
        "q": ParagraphStyle("q", fontName="Arial-Bold", fontSize=10, leading=14, spaceBefore=7, spaceAfter=2, textColor=colors.HexColor("#EE10B0")),
        "a": ParagraphStyle("a", fontName="Arial", fontSize=10, leading=14, spaceAfter=5, leftIndent=8),
        "tip": ParagraphStyle("tip", fontName="Arial", fontSize=9.5, leading=13, spaceAfter=3, leftIndent=8),
    }


def P(text, style):
    return Paragraph(esc(text), style)


def main():
    s = build_styles()
    doc = SimpleDocTemplate(str(PDF_PATH), pagesize=A4, leftMargin=1.8 * cm, rightMargin=1.8 * cm, topMargin=1.6 * cm, bottomMargin=1.6 * cm)
    story = []

    story.append(P("SoundBloom — сценарий защиты по LANDING PAGE", s["title"]))
    story.append(P("Структура 1:1 с landingPage/src/App.tsx и content.ts (ru)", s["body"]))
    story.append(P("Меню: О проекте · Проблема · Платформа · Возможности", s["meta"]))
    story.append(Spacer(1, 6))

    story.append(P("КАК ИДТИ ПО САЙТУ (5–7 мин)", s["part"]))
    story.append(P("Открываешь landing page → скроллишь сверху вниз (или кликаешь пункты меню). Говори по секциям ниже.", s["body"]))
    story.append(P("Hero (~30с) → О проекте (~1м) → Проблема (~1м) → Платформа (~1м) → Возможности (~1,5м) → Заключение (~30с) ≈ 5–6 мин", s["tip"]))

    for sec in SECTIONS:
        block = [
            P(f"#{sec['id']}  ·  {sec['label']}", s["sec"]),
            P(f"Пункт меню: {sec['nav']}  ·  Время: {sec['time']}", s["meta"]),
            P("На экране (читай с landing page):", s["meta"]),
        ]
        for line in sec["on_screen"]:
            block.append(P(f"• {line}", s["screen"]))
        block.append(P("Что говорить:", s["meta"]))
        block.append(P(f"«{sec['say']}»", s["say"]))
        if sec.get("note"):
            block.append(P(f"⚡ {sec['note']}", s["note"]))
        story.append(KeepTogether(block))
        story.append(Spacer(1, 6))

    story.append(PageBreak())
    story.append(P("ЖИВОЕ DEMO (после секции «Возможности»)", s["part"]))
    for t in [
        "Нажми «Открыть SoundBloom» — откроется приложение.",
        "Поиск → плеер → лайк в библиотеку.",
        "Смена языка ru / kk / en.",
        "Artist Studio — загрузка или список треков.",
        "Operator/Admin — модерация (если есть доступ).",
    ]:
        story.append(P(f"• {t}", s["tip"]))

    story.append(Spacer(1, 8))
    story.append(P("3 ГЛАВНЫХ ОТЛИЧИЯ ОТ SPOTIFY", s["part"]))
    for t in [
        "Артист сам публикует музыку (Artist Studio)",
        "Слушатель + артист = один продукт",
        "ru / kk / en + модерация + свой full-stack",
    ]:
        story.append(P(f"• {t}", s["tip"]))

    story.append(PageBreak())
    story.append(P("ВОПРОСЫ И ОТВЕТЫ", s["part"]))

    for group_title, items in QA:
        story.append(P(group_title, s["sec"]))
        for q, a in items:
            story.append(P(f"В: {q}", s["q"]))
            story.append(P(f"О: {a}", s["a"]))

    story.append(Spacer(1, 10))
    story.append(P("ШПАРГАЛКА — НАВИГАЦИЯ LANDING PAGE", s["part"]))
    story.append(P("Hero → #about (01 Цель) → #problem (02 Шум→Расцвет) → #showcase (03 React→.NET→Supabase) → #features (04 шесть фич + 71/3/24/2) → #finale (Спасибо)", s["body"]))

    doc.build(story)
    print(f"Saved: {PDF_PATH}")


if __name__ == "__main__":
    main()
