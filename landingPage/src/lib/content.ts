export type Lang = "en" | "ru" | "kk";

export const LANGS: { code: Lang; short: string; label: string }[] = [
  { code: "en", short: "EN", label: "English" },
  { code: "ru", short: "RU", label: "Русский" },
  { code: "kk", short: "KK", label: "Қазақша" },
];

export interface NavLink {
  id: string;
  label: string;
}

export interface FeatureItem {
  no: string;
  title: string;
  text: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface Step {
  title: string;
  text: string;
}

export interface SiteContent {
  nav: { links: NavLink[]; cta: string };
  hero: {
    eyebrow: string;
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollCue: string;
  };
  about: {
    index: string;
    label: string;
    heading: string;
    paragraphs: string[];
    pull: string;
  };
  problem: {
    index: string;
    label: string;
    heading: string;
    problemTitle: string;
    problems: string[];
    solutionTitle: string;
    solutions: string[];
  };
  showcase: {
    index: string;
    label: string;
    heading: string;
    subtitle: string;
    steps: Step[];
  };
  features: {
    index: string;
    label: string;
    heading: string;
    items: FeatureItem[];
    stats: Stat[];
  };
  finale: {
    kicker: string;
    titleTop: string;
    titleBottom: string;
    subtitle: string;
    cta: string;
    note: string;
  };
  footer: { tagline: string; madeWith: string; copyright: string };
}

export const CONTENT: Record<Lang, SiteContent> = {
  en: {
    nav: {
      links: [
        { id: "about", label: "About" },
        { id: "problem", label: "Solution" },
        { id: "showcase", label: "Product" },
        { id: "features", label: "Features" },
      ],
      cta: "Listen",
    },
    hero: {
      eyebrow: "Diploma project · SoundBloom",
      titleTop: "Sound",
      titleBottom: "in bloom",
      subtitle:
        "Music streaming platform «SoundBloom». Frontend · Backend · Full-stack development.",
      ctaPrimary: "Open SoundBloom",
      ctaSecondary: "About the project",
      scrollCue: "Scroll to explore",
    },
    about: {
      index: "01",
      label: "Goal & tasks",
      heading: "Design and implement the full-stack «SoundBloom» platform",
      paragraphs: [
        "Goal: streaming frontend with library and artist studio, .NET backend with catalog, subscriptions and moderation.",
        "Relevance: lossless audio, smart catalog, artist studio and ru/kk/en localization increase engagement and give musicians their own stage.",
      ],
      pull: "Goal achieved: the platform is deployed and running.",
    },
    problem: {
      index: "02",
      label: "Problem & relevance",
      heading: "Why modern streaming lacks a living sound",
      problemTitle: "The noise",
      problems: [
        "Interruptions and compressed audio break the moment",
        "Artists struggle to publish and analyze tracks",
        "Users expect search, offline and three languages",
        "No unified platform for listeners and artists",
      ],
      solutionTitle: "The bloom",
      solutions: [
        "Lossless, Premium and Family without ads",
        "Artist Studio: upload, moderation, analytics",
        "ru / kk / en localization and responsive layout",
        "Full-stack: React + .NET + Supabase",
      ],
    },
    showcase: {
      index: "03",
      label: "End-to-end flow",
      heading: "How the platform works as a whole",
      subtitle: "From browser to database — one product scenario.",
      steps: [
        { title: "React + Vite", text: "Catalog, player, library, artist studio, Premium, ru/kk/en localization." },
        { title: "ASP.NET Core API", text: "Catalog & streaming, library, subscriptions, promos, admin/operator panels." },
        { title: "Supabase", text: "PostgreSQL, Auth, Storage — unified backend for data and auth." },
      ],
    },
    features: {
      index: "04",
      label: "Client experience",
      heading: "",
      items: [
        { no: "01", title: "Music player", text: "Streaming, queue, likes — Jamendo, iTunes and artist uploads in one player." },
        { no: "02", title: "Library & search", text: "Playlists, albums, genres and saved tracks tied to your account." },
        { no: "03", title: "ru / kk / en", text: "Full UI in three languages without losing your place." },
        { no: "04", title: "Artist Studio", text: "Upload tracks, pass moderation, view listening analytics." },
        { no: "05", title: "Premium & Family", text: "Lossless, offline downloads, no ads, family plan and promo codes." },
      ],
      stats: [
        { value: "71", label: "REST API" },
        { value: "3", label: "UI languages" },
        { value: "24", label: "DB tables" },
        { value: "2", label: "Moderation roles" },
      ],
    },
    finale: {
      kicker: "Conclusion",
      titleTop: "Thank you",
      titleBottom: "for your attention",
      subtitle: "Backend: ASP.NET Core. Frontend: React + Vite. System deployed and ready for demo.",
      cta: "Open SoundBloom",
      note: "Kokish Amir Armanuly · group P-23-62B",
    },
    footer: {
      tagline: "SoundBloom — diploma project.",
      madeWith: "Kokish Amir Armanuly · group P-23-62B",
      copyright: "ASTANA POLYTECHNIC · 2026",
    },
  },

  ru: {
    nav: {
      links: [
        { id: "about", label: "О проекте" },
        { id: "problem", label: "Проблема" },
        { id: "showcase", label: "Платформа" },
        { id: "features", label: "Возможности" },
      ],
      cta: "Слушать",
    },
    hero: {
      eyebrow: "Дипломный проект · SoundBloom",
      titleTop: "Звук",
      titleBottom: "в цвету",
      subtitle:
        "Музыкальная стриминговая платформа «SoundBloom». Клиентская часть (Frontend) · Серверная часть (Backend).",
      ctaPrimary: "Открыть SoundBloom",
      ctaSecondary: "О проекте",
      scrollCue: "Листайте вниз",
    },
    about: {
      index: "01",
      label: "Цель и задачи",
      heading: "Спроектировать и реализовать full-stack платформу «SoundBloom»",
      paragraphs: [
        "Цель — стриминговый frontend с библиотекой и artist studio, backend на .NET с каталогом, подписками и модерацией.",
        "Актуальность: платформа с lossless-звуком, умным каталогом, студией артиста и локализацией ru/kk/en повышает вовлечённость и даёт музыкантам собственную площадку.",
      ],
      pull: "",
    },
    problem: {
      index: "02",
      label: "Проблема и актуальность",
      heading: "Почему современному стримингу не хватает «живого» звука",
      problemTitle: "Проблемы",
      problems: [
        "Прерывания и сжатый звук рвут момент",
        "Артистам сложно публиковать и анализировать треки",
        "Нужны поиск, три языка на любом устройстве",
        "Нет единой платформы для слушателя и артиста",
      ],
      solutionTitle: "актуальность",
      solutions: [
        "Lossless, Premium и Family без рекламы",
        "Artist Studio: загрузка, модерация, аналитика",
        "Full-stack: React + .NET + Supabase",
      ],
    },
    showcase: {
      index: "03",
      label: "Сквозной путь",
      heading: "Как устроена платформа целиком",
      subtitle: "От браузера до базы данных — один продуктовый сценарий.",
      steps: [
        {
          title: "React + Vite",
          text: "Каталог, плеер, библиотека, artist studio, Premium, локализация ru/kk/en.",
        },
        {
          title: "ASP.NET Core API",
          text: "Каталог и стриминг, библиотека, подписки, промокоды, admin/operator панели.",
        },
        {
          title: "Supabase",
          text: "PostgreSQL, Auth, Storage — единый backend для данных и авторизации.",
        },
      ],
    },
    features: {
      index: "04",
      label: "Клиентский опыт",
      heading: "",
      items: [
        { no: "01", title: "Музыкальный плеер", text: "Стриминг, очередь, лайки — Jamendo, iTunes и треки артистов в одном плеере." },
        { no: "02", title: "Библиотека и поиск", text: "Плейлисты, альбомы, жанры и сохранённые треки в аккаунте." },
        { no: "03", title: "ru / kk / en", text: "Полный интерфейс на трёх языках без сброса сценария." },
        { no: "04", title: "Artist Studio", text: "Загрузка треков, модерация и аналитика прослушиваний." },
        { no: "05", title: "Premium и Family", text: "Lossless, офлайн, без рекламы, семейный тариф и промокоды." },
      ],
      stats: [
        { value: "71", label: "REST API" },
        { value: "3", label: "языка UI" },
        { value: "24", label: "таблиц БД" },
        { value: "2", label: "роли модерации" },
      ],
    },
    finale: {
      kicker: "Заключение",
      titleTop: "Спасибо",
      titleBottom: "за внимание",
      subtitle: "Backend: ASP.NET Core. Frontend: React + Vite. Система развёрнута и готова к демонстрации.",
      cta: "Открыть SoundBloom",
      note: "Кокиш Амир Арманулы · группа П-23-62Б",
    },
    footer: {
      tagline: "SoundBloom — дипломный проект.",
      madeWith: "Кокиш Амир Арманулы · группа П-23-62Б",
      copyright: "ASTANA POLYTECHNIC · 2026",
    },
  },

  kk: {
    nav: {
      links: [
        { id: "about", label: "Жоба" },
        { id: "problem", label: "Шешім" },
        { id: "showcase", label: "Өнім" },
        { id: "features", label: "Мүмкіндіктер" },
      ],
      cta: "Тыңдау",
    },
    hero: {
      eyebrow: "Дипломдық жоба · SoundBloom",
      titleTop: "Дыбыс",
      titleBottom: "гүлдейді",
      subtitle:
        "«SoundBloom» музыкалық стриминг платформасы. Frontend · Backend · Full-stack әзірлеу.",
      ctaPrimary: "SoundBloom ашу",
      ctaSecondary: "Жоба туралы",
      scrollCue: "Төмен айналдырыңыз",
    },
    about: {
      index: "01",
      label: "Мақсат және міндеттер",
      heading: "«SoundBloom» full-stack платформасын жобалау және іске асыру",
      paragraphs: [
        "Мақсат: кітапхана мен artist studio бар frontend, каталог, подписка және модерация бар .NET backend.",
        "Өзектілік: lossless дыбыс, ақылды каталог, artist studio және ru/kk/en локализациясы engagement арттырады.",
      ],
      pull: "Мақсатқа жетілді: платформа деплойдалды.",
    },
    problem: {
      index: "02",
      label: "Мәселе және өзектілік",
      heading: "Неге заманауи стримингке «тірі» дыбыс жетіспейді",
      problemTitle: "Шу",
      problems: [
        "Үзілістер мен қысылған дыбыс сәтті бұзады",
        "Әртістерге трек жариялау қиын",
        "Іздеу, офлайн және үш тіл қажет",
        "Тыңдаушы мен әртистерге бірыңғай платформа жоқ",
      ],
      solutionTitle: "Гүлдену",
      solutions: [
        "Lossless, Premium және Family",
        "Artist Studio: жүктеу, модерация, аналитика",
        "ru / kk / en локализация",
        "Full-stack: React + .NET + Supabase",
      ],
    },
    showcase: {
      index: "03",
      label: "Өнім жолы",
      heading: "Платформа қалай жұмыс істейді",
      subtitle: "Браузерден базаға дейін — бір сценарий.",
      steps: [
        { title: "React + Vite", text: "Каталог, плеер, кітапхана, artist studio, Premium, ru/kk/en." },
        { title: "ASP.NET Core API", text: "Каталог, кітапхана, подписка, промо, admin/operator." },
        { title: "Supabase", text: "PostgreSQL, Auth, Storage — деректер мен auth." },
      ],
    },
    features: {
      index: "04",
      label: "Клиент тәжірибесі",
      heading: "",
      items: [
        { no: "01", title: "Музыкалық плеер", text: "Стриминг, кезек, лайктар — Jamendo, iTunes және әртістер тректері." },
        { no: "02", title: "Кітапхана", text: "Плейлисттер, альбомдар, жанрлар — аккаунтқа байланыған." },
        { no: "03", title: "ru / kk / en", text: "Үш тілде толық интерфейс, сценарий үзілмейді." },
        { no: "04", title: "Artist Studio", text: "Трек жүктеу, модерация және аналитика." },
        { no: "05", title: "Premium және Family", text: "Lossless, офлайн, жарнамасыз, отбасылық тариф." },
      ],
      stats: [
        { value: "71", label: "REST API" },
        { value: "3", label: "UI тілі" },
        { value: "24", label: "БД кестесі" },
        { value: "2", label: "модерация рөлі" },
      ],
    },
    finale: {
      kicker: "Қорытынды",
      titleTop: "Назарларыңызға",
      titleBottom: "рахмет",
      subtitle: "Backend: ASP.NET Core. Frontend: React + Vite. Жүйе деплойдалды.",
      cta: "SoundBloom ашу",
      note: "Кокиш Амир Арманулы · П-23-62Б",
    },
    footer: {
      tagline: "SoundBloom — дипломдық жоба.",
      madeWith: "Кокиш Амир Арманулы · П-23-62Б",
      copyright: "ASTANA POLYTECHNIC · 2026",
    },
  },
};
