# -*- coding: utf-8 -*-
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

DESKTOP = Path.home() / "Desktop"
PDF_PATH = DESKTOP / "SoundBloom_Описание_проекта.pdf"


def esc(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def main():
    pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
    pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))

    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
    )

    title = ParagraphStyle(
        "title",
        fontName="Arial-Bold",
        fontSize=20,
        leading=26,
        spaceAfter=16,
        alignment=1,
        textColor=colors.HexColor("#1E3A5F"),
    )
    h1 = ParagraphStyle(
        "h1",
        fontName="Arial-Bold",
        fontSize=13,
        leading=18,
        spaceBefore=14,
        spaceAfter=6,
        textColor=colors.HexColor("#1E3A5F"),
    )
    body = ParagraphStyle(
        "body",
        fontName="Arial",
        fontSize=11,
        leading=16,
        spaceAfter=8,
        leftIndent=0,
    )
    quote = ParagraphStyle(
        "quote",
        fontName="Arial-Bold",
        fontSize=12,
        leading=18,
        spaceBefore=20,
        spaceAfter=8,
        leftIndent=12,
        rightIndent=12,
        backColor=colors.HexColor("#F0F4F8"),
        borderPadding=10,
        textColor=colors.HexColor("#1E3A5F"),
    )
    short = ParagraphStyle(
        "short",
        fontName="Arial-Bold",
        fontSize=12,
        leading=18,
        spaceBefore=10,
        spaceAfter=4,
    )

    story = [
        Paragraph(esc("SoundBloom — чем отличается от Spotify и других"), title),
        Spacer(1, 8),
    ]

    points = [
        (
            "1. Музыкант загружает треки сам — без посредников",
            "На Spotify нельзя просто залить песню. В SoundBloom — Artist Studio: "
            "регистрация → загрузка → публикация.",
        ),
        (
            "2. Одна платформа и для слушателя, и для артиста",
            "Не «Spotify + Spotify for Artists» как два мира. Один аккаунт — "
            "и слушаешь, и публикуешь.",
        ),
        (
            "3. Свой каталог + чужие каталоги в одном месте",
            "Jamendo, iTunes и треки артистов SoundBloom — в одном интерфейсе "
            "и одной библиотеке.",
        ),
        (
            "4. Модерация каждого трека",
            "Ничего не попадает в каталог без проверки. Роли Operator / Admin — "
            "approve или reject.",
        ),
        (
            "5. Три языка сразу: ru / kk / en",
            "У Spotify и Apple казахский почти не приоритет. В SoundBloom — "
            "полный интерфейс на казахском с первого дня.",
        ),
        (
            "6. Это твоя платформа, а не чужой сервис",
            "Свой код, своя БД, свой API — 71 эндпоинт, полный контроль. "
            "Spotify так не отдашь.",
        ),
    ]

    for head, text in points:
        story.append(Paragraph(esc(head), h1))
        story.append(Paragraph(esc(text), body))

    story.append(Spacer(1, 12))
    story.append(Paragraph(esc("Одной фразой для защиты"), h1))
    story.append(
        Paragraph(
            esc(
                "SoundBloom — не копия Spotify, а платформа, где слушатель и "
                "независимый артист живут в одном продукте: свой каталог с "
                "модерацией, три языка и полный full-stack под твоим контролем."
            ),
            quote,
        )
    )

    story.append(Spacer(1, 16))
    story.append(Paragraph(esc("Три главных (если спросят коротко)"), h1))
    for line in [
        "Артист сам публикует музыку",
        "Слушатель + артист = один продукт",
        "ru / kk / en + модерация + свой full-stack",
    ]:
        story.append(Paragraph(esc(f"• {line}"), short))

    doc.build(story)
    print(f"PDF updated: {PDF_PATH}")


if __name__ == "__main__":
    main()
