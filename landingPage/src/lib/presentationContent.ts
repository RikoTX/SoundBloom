import type { Lang } from "./content";

export interface PresCard {
  title: string;
  text: string;
}

export interface PresTask {
  text: string;
}

export interface PresLayer {
  title: string;
  text: string;
}

export interface PresStat {
  value: string;
  label: string;
  sub?: string;
}

export interface PresSummary {
  text: string;
}

export interface PresentationContent {
  nav: { id: string; label: string }[];
  title: {
    badge: string;
    heading: string;
    stack: string;
    role: string;
  };
  problem: {
    eyebrow: string;
    heading: string;
    cards: PresCard[];
    relevanceLabel: string;
    relevance: string;
    slide: string;
  };
  goals: {
    eyebrow: string;
    heading: string;
    goalLabel: string;
    goal: string;
    tasks: PresTask[];
    slide: string;
  };
  platform: {
    eyebrow: string;
    heading: string;
    flow: string[];
    frontend: { title: string; stack: string; text: string };
    backend: { title: string; stack: string; text: string };
    slide: string;
  };
  architecture: {
    eyebrow: string;
    heading: string;
    layers: PresLayer[];
    stats: PresStat[];
    slide: string;
  };
  experience: {
    eyebrow: string;
    heading: string;
    cards: PresCard[];
    slide: string;
  };
  results: {
    eyebrow: string;
    heading: string;
    stats: PresStat[];
    bannerLabel: string;
    banner: { value: string; label: string }[];
    slide: string;
  };
  conclusion: {
    eyebrow: string;
    heading: string;
    rows: PresSummary[];
    thanks: string;
    slide: string;
  };
  footer: { cta: string };
}

export const PRESENTATION: Record<Lang, PresentationContent> = {
  ru: {
    nav: [
      { id: "title", label: "Титул" },
      { id: "problem", label: "Проблема" },
      { id: "goals", label: "Цели" },
      { id: "platform", label: "Платформа" },
      { id: "architecture", label: "Архитектура" },
      { id: "experience", label: "Опыт" },
      { id: "results", label: "Итоги" },
      { id: "conclusion", label: "Заключение" },
    ],
    title: {
      badge: "Дипломный проект",
      heading: "Музыкальная стриминговая платформа «SoundBloom»",
      stack: "Клиентская часть (Frontend) · Серверная часть (Backend)",
      role: "Full-stack разработка",
    },
    problem: {
      eyebrow: "Проблема и актуальность",
      heading: "Почему современному стримингу не хватает «живого» звука",
      cards: [
        {
          title: "Шум и реклама",
          text: "Прерывания рвут момент; сжатый звук и перегруженный интерфейс отталкивают слушателя.",
        },
        {
          title: "Артисты без сцены",
          text: "Независимым музыкантам сложно публиковать треки, видеть аналитику и находить аудиторию.",
        },
        {
          title: "Ожидания пользователя",
          text: "Нужны быстрый поиск, библиотека, офлайн, три языка и единый опыт на любом устройстве.",
        },
      ],
      relevanceLabel: "Актуальность:",
      relevance:
        "веб-платформа с lossless-звуком, умным каталогом, студией артиста и локализацией ru/kk/en повышает вовлечённость и даёт музыкантам собственную площадку.",
      slide: "02 / 10",
    },
    goals: {
      eyebrow: "Цель и задачи",
      heading: "Цель проекта и решаемые задачи",
      goalLabel: "Цель",
      goal: "Спроектировать и реализовать full-stack платформу «SoundBloom»: стриминговый frontend с библиотекой и artist studio, backend на .NET с каталогом, подписками и модерацией.",
      tasks: [
        { text: "Проанализировать предметную область и формализовать требования" },
        { text: "Спроектировать БД, REST API и архитектуру клиента" },
        { text: "Реализовать каталог, поиск и интеграции Jamendo / iTunes" },
        { text: "Реализовать авторизацию, библиотеку, плейлисты и плеер" },
        { text: "Добавить artist studio: загрузка, модерация, аналитика" },
        { text: "Внедрить Premium, промокоды и семейный тариф" },
        { text: "Обеспечить локализацию ru/kk/en и адаптивную вёрстку" },
        { text: "Развернуть frontend и backend, провести тестирование" },
      ],
      slide: "03 / 10",
    },
    platform: {
      eyebrow: "Что сделано · сквозной путь",
      heading: "Как устроена платформа целиком",
      flow: [
        "Пользователь (браузер / PWA)",
        "React + Vite frontend",
        "ASP.NET Core API",
        "Supabase (PostgreSQL + Auth + Storage)",
      ],
      frontend: {
        title: "Frontend",
        stack: "React 19 · Vite · TypeScript · Tailwind",
        text: "Каталог, плеер, библиотека, artist studio, Premium, локализация ru/kk/en, тёмная и светлая темы.",
      },
      backend: {
        title: "Backend",
        stack: "C# · ASP.NET Core · Supabase REST",
        text: "Каталог и стриминг, библиотека, подписки, промокоды, admin/operator панели, i18n API.",
      },
      slide: "04 / 10",
    },
    architecture: {
      eyebrow: "Что сделано · архитектура",
      heading: "Слоистая архитектура и модель данных",
      layers: [
        { title: "Клиент / PWA", text: "React, React Router, i18next, Zustand-подобное состояние" },
        { title: "Middleware", text: "CORS · JWT Auth · Authorization · Kestrel" },
        { title: "Endpoints → Services", text: "Catalog, Library, Artist, Admin, Subscription" },
        { title: "Supabase", text: "PostgreSQL · Auth · Storage · Row Level Security" },
      ],
      stats: [
        { value: "71", label: "эндпоинтов API", sub: "REST" },
        { value: "24", label: "таблиц в БД", sub: "PostgreSQL · public" },
        { value: "3", label: "языка интерфейса", sub: "ru · kk · en" },
        { value: "10", label: "модулей backend", sub: "Endpoints" },
      ],
      slide: "05 / 10",
    },
    experience: {
      eyebrow: "Что сделано · клиентский опыт",
      heading: "Интерфейс, плеер и каталог",
      cards: [
        {
          title: "Музыкальный плеер",
          text: "Стриминг, очередь, лайки, превью из Jamendo и iTunes рядом с треками артистов.",
        },
        {
          title: "Библиотека и поиск",
          text: "Плейлисты, альбомы, жанры, сохранённые треки — всё привязано к аккаунту.",
        },
        {
          title: "Локализация ru / kk / en",
          text: "Полный перевод интерфейса; переключение языка без сброса сценария.",
        },
        {
          title: "Artist Studio",
          text: "Регистрация артиста, загрузка треков, модерация, аналитика прослушиваний.",
        },
        {
          title: "Premium и Family",
          text: "Lossless, офлайн-скачивание, без рекламы, семейный тариф и промокоды.",
        },
        {
          title: "Светлая и темная тема",
          text: "Светлая и темная тема, подстраивается под вас.",
        },
      ],
      slide: "08 / 10",
    },
    results: {
      eyebrow: "Результаты и оценка",
      heading: "Итоги: функциональность, надёжность, масштаб",
      stats: [
        { value: "3", label: "языка UI", sub: "ru · kk · en" },
        { value: "71", label: "API эндпоинтов", sub: "ASP.NET Core" },
        { value: "6", label: "ключевых модулей", sub: "Auth · Catalog · Library…" },
        { value: "2", label: "роли модерации", sub: "Admin · Operator" },
      ],
      bannerLabel: "Стек разработки",
      banner: [
        { value: "React", label: "Frontend (Vite + TS)" },
        { value: ".NET", label: "Backend (ASP.NET)" },
        { value: "Supabase", label: "БД · Auth · Storage" },
      ],
      slide: "09 / 10",
    },
    conclusion: {
      eyebrow: "Заключение",
      heading: "",
      rows: [
        {
          text: "Backend: ASP.NET Core, каталог и стриминг, библиотека, подписки, admin/operator, i18n API.",
        },
        {
          text: "Frontend: React + Vite, плеер, библиотека, artist studio, Premium, локализация ru/kk/en.",
        },
        {
          text: "Система развёрнута (GitHub Pages + backend), протестирована и готова к демонстрации.",
        },
      ],
      thanks: "Спасибо за внимание!",
      slide: "10 / 10",
    },
    footer: { cta: "Открыть SoundBloom" },
  },

  en: {
    nav: [
      { id: "title", label: "Title" },
      { id: "problem", label: "Problem" },
      { id: "goals", label: "Goals" },
      { id: "platform", label: "Platform" },
      { id: "architecture", label: "Architecture" },
      { id: "experience", label: "Experience" },
      { id: "results", label: "Results" },
      { id: "conclusion", label: "Conclusion" },
    ],
    title: {
      badge: "Diploma Project",
      heading: "Music streaming platform «SoundBloom»",
      stack: "Frontend · Backend",
      role: "Full-stack development",
    },
    problem: {
      eyebrow: "Problem & relevance",
      heading: "Why modern streaming lacks a living sound",
      cards: [
        { title: "Noise & ads", text: "Interruptions break the moment; compressed audio and cluttered UI push listeners away." },
        { title: "Artists without a stage", text: "Independent musicians struggle to publish, analyze, and reach an audience." },
        { title: "User expectations", text: "Fast search, library, offline, three languages, one experience on any device." },
      ],
      relevanceLabel: "Relevance:",
      relevance: "a web platform with lossless audio, smart catalog, artist studio and ru/kk/en localization increases engagement and gives musicians their own stage.",
      slide: "02 / 10",
    },
    goals: {
      eyebrow: "Goals & tasks",
      heading: "Project goal and tasks",
      goalLabel: "Goal",
      goal: "Design and implement the full-stack «SoundBloom» platform: streaming frontend with library and artist studio, .NET backend with catalog, subscriptions and moderation.",
      tasks: [
        { text: "Analyze the domain and formalize requirements" },
        { text: "Design DB, REST API and client architecture" },
        { text: "Implement catalog, search and Jamendo / iTunes integrations" },
        { text: "Implement auth, library, playlists and player" },
        { text: "Add artist studio: upload, moderation, analytics" },
        { text: "Implement Premium, promo codes and family plan" },
        { text: "Provide ru/kk/en localization and responsive layout" },
        { text: "Deploy frontend and backend, run testing" },
      ],
      slide: "03 / 10",
    },
    platform: {
      eyebrow: "Done · end-to-end flow",
      heading: "How the platform works as a whole",
      flow: ["User (browser / PWA)", "React + Vite frontend", "ASP.NET Core API", "Supabase (PostgreSQL + Auth + Storage)"],
      frontend: {
        title: "Frontend",
        stack: "React 19 · Vite · TypeScript · Tailwind",
        text: "Catalog, player, library, artist studio, Premium, ru/kk/en localization, dark & light themes.",
      },
      backend: {
        title: "Backend",
        stack: "C# · ASP.NET Core · Supabase REST",
        text: "Catalog & streaming, library, subscriptions, promos, admin/operator panels, i18n API.",
      },
      slide: "04 / 10",
    },
    architecture: {
      eyebrow: "Done · architecture",
      heading: "Layered architecture and data model",
      layers: [
        { title: "Client / PWA", text: "React, React Router, i18next, client state" },
        { title: "Middleware", text: "CORS · JWT Auth · Authorization · Kestrel" },
        { title: "Endpoints → Services", text: "Catalog, Library, Artist, Admin, Subscription" },
        { title: "Supabase", text: "PostgreSQL · Auth · Storage · Row Level Security" },
      ],
      stats: [
        { value: "71", label: "API endpoints", sub: "REST" },
        { value: "24", label: "database tables", sub: "PostgreSQL · public" },
        { value: "3", label: "UI languages", sub: "ru · kk · en" },
        { value: "10", label: "backend modules", sub: "Endpoints" },
      ],
      slide: "05 / 10",
    },
    experience: {
      eyebrow: "Done · client experience",
      heading: "Interface, player and catalog",
      cards: [
        { title: "Music player", text: "Streaming, queue, likes, Jamendo and iTunes previews alongside artist uploads." },
        { title: "Library & search", text: "Playlists, albums, genres, saved tracks — all tied to the account." },
        { title: "Localization ru / kk / en", text: "Full UI translation; switch language without losing context." },
        { title: "Artist Studio", text: "Artist registration, track upload, moderation, listening analytics." },
        { title: "Premium & Family", text: "Lossless, offline downloads, no ads, family plan and promo codes." },
        { title: "Responsive & themes", text: "Dark and light theme, responsive layout, GitHub Pages deploy." },
      ],
      slide: "08 / 10",
    },
    results: {
      eyebrow: "Results & assessment",
      heading: "Outcomes: functionality, reliability, scale",
      stats: [
        { value: "3", label: "UI languages", sub: "ru · kk · en" },
        { value: "71", label: "API endpoints", sub: "ASP.NET Core" },
        { value: "6", label: "core modules", sub: "Auth · Catalog · Library…" },
        { value: "2", label: "moderation roles", sub: "Admin · Operator" },
      ],
      bannerLabel: "Development stack",
      banner: [
        { value: "React", label: "Frontend (Vite + TS)" },
        { value: ".NET", label: "Backend (ASP.NET)" },
        { value: "Supabase", label: "DB · Auth · Storage" },
      ],
      slide: "09 / 10",
    },
    conclusion: {
      eyebrow: "Conclusion",
      heading: "Goal achieved: the platform is deployed and running",
      rows: [
        { text: "Backend: ASP.NET Core, catalog & streaming, library, subscriptions, admin/operator, i18n API." },
        { text: "Frontend: React + Vite, player, library, artist studio, Premium, ru/kk/en localization." },
        { text: "System deployed (GitHub Pages + backend), tested and ready for demo." },
      ],
      thanks: "Thank you for your attention!",
      slide: "10 / 10",
    },
    footer: { cta: "Open SoundBloom" },
  },

  kk: {
    nav: [
      { id: "title", label: "Титул" },
      { id: "problem", label: "Мәселе" },
      { id: "goals", label: "Мақсат" },
      { id: "platform", label: "Платформа" },
      { id: "architecture", label: "Архитектура" },
      { id: "experience", label: "Тәжірибе" },
      { id: "results", label: "Нәтиже" },
      { id: "conclusion", label: "Қорытынды" },
    ],
    title: {
      badge: "Дипломдық жоба",
      heading: "«SoundBloom» музыкалық стриминг платформасы",
      stack: "Frontend · Backend",
      role: "Full-stack әзірлеу",
    },
    problem: {
      eyebrow: "Мәселе және өзектілік",
      heading: "Неге заманауи стримингке «тірі» дыбыс жетіспейді",
      cards: [
        { title: "Шу мен жарнама", text: "Үзілістер сәтті бұзады; қысылған дыбыс пен күрделі интерфейс тыңдаушыны шошытрады." },
        { title: "Сахнасыз әртістер", text: "Тәуелсіз музыканттарға трек жариялау, аналитика және аудитория табу қиын." },
        { title: "Пайдаланушы күтілетіні", text: "Жылдам іздеу, кітапхана, офлайн, үш тіл және кез келген құрылғыда бірыңғай тәжірибе." },
      ],
      relevanceLabel: "Өзектілік:",
      relevance: "lossless дыбыс, ақылды каталог, artist studio және ru/kk/en локализациясы бар веб-платформа engagement арттырады.",
      slide: "02 / 10",
    },
    goals: {
      eyebrow: "Мақсат және міндеттер",
      heading: "Жоба мақсаты және шешілетін міндеттер",
      goalLabel: "Мақсат",
      goal: "«SoundBloom» full-stack платформасын жобалау және іске асыру: кітапхана мен artist studio бар frontend, каталог, подписка және модерация бар .NET backend.",
      tasks: [
        { text: "Предметтік саланы талдау және талаптарды формализациялау" },
        { text: "БД, REST API және клиент архитектурасын жобалау" },
        { text: "Каталог, іздеу және Jamendo / iTunes интеграцияларын іске асыру" },
        { text: "Auth, кітапхана, плейлисттер және плеерді іске асыру" },
        { text: "Artist studio: жүктеу, модерация, аналитика" },
        { text: "Premium, промокодтар және отбасылық тариф" },
        { text: "ru/kk/en локализация және бейімделгіш layout" },
        { text: "Frontend/backend деплой және тестілеу" },
      ],
      slide: "03 / 10",
    },
    platform: {
      eyebrow: "Не істелді · өнім жолы",
      heading: "Платформа қалай жұмыс істейді",
      flow: ["Пайдаланушы (браузер / PWA)", "React + Vite frontend", "ASP.NET Core API", "Supabase (PostgreSQL + Auth + Storage)"],
      frontend: {
        title: "Frontend",
        stack: "React 19 · Vite · TypeScript · Tailwind",
        text: "Каталог, плеер, кітапхана, artist studio, Premium, ru/kk/en, қараңғы/жарық тема.",
      },
      backend: {
        title: "Backend",
        stack: "C# · ASP.NET Core · Supabase REST",
        text: "Каталог, кітапхана, подписка, промо, admin/operator, i18n API.",
      },
      slide: "04 / 10",
    },
    architecture: {
      eyebrow: "Не істелді · архитектура",
      heading: "Қабатты архитектура және деректер моделі",
      layers: [
        { title: "Клиент / PWA", text: "React, React Router, i18next" },
        { title: "Middleware", text: "CORS · JWT Auth · Authorization" },
        { title: "Endpoints → Services", text: "Catalog, Library, Artist, Admin, Subscription" },
        { title: "Supabase", text: "PostgreSQL · Auth · Storage · RLS" },
      ],
      stats: [
        { value: "71", label: "API эндпоинт", sub: "REST" },
        { value: "24", label: "БД кестелері", sub: "PostgreSQL · public" },
        { value: "3", label: "UI тілі", sub: "ru · kk · en" },
        { value: "10", label: "backend модулі", sub: "Endpoints" },
      ],
      slide: "05 / 10",
    },
    experience: {
      eyebrow: "Не істелді · клиент тәжірибесі",
      heading: "Интерфейс, плеер және каталог",
      cards: [
        { title: "Музыкалық плеер", text: "Стриминг, кезек, лайктар, Jamendo/iTunes превью." },
        { title: "Кітапхана және іздеу", text: "Плейлисттер, альбомдар, жанрлар — аккаунтқа байланыған." },
        { title: "Локализация ru / kk / en", text: "Толық аударма; тіл ауыстыру сценарийді бұзбайды." },
        { title: "Artist Studio", text: "Әртісті тіркеу, трек жүктеу, модерация, аналитика." },
        { title: "Premium және Family", text: "Lossless, офлайн, жарнамасыз, отбасылық тариф." },
        { title: "Бейімделгіштік", text: "Қараңғы/жарық тема, responsive, GitHub Pages." },
      ],
      slide: "08 / 10",
    },
    results: {
      eyebrow: "Нәтижелер",
      heading: "Нәтижелер: функционалдылық, сенімділік",
      stats: [
        { value: "3", label: "UI тілі", sub: "ru · kk · en" },
        { value: "71", label: "API эндпоинт", sub: "ASP.NET Core" },
        { value: "6", label: "негізгі модуль", sub: "Auth · Catalog…" },
        { value: "2", label: "модерация рөлі", sub: "Admin · Operator" },
      ],
      bannerLabel: "Әзірлеу стегі",
      banner: [
        { value: "React", label: "Frontend (Vite + TS)" },
        { value: ".NET", label: "Backend (ASP.NET)" },
        { value: "Supabase", label: "БД · Auth · Storage" },
      ],
      slide: "09 / 10",
    },
    conclusion: {
      eyebrow: "Қорытынды",
      heading: "Мақсатқа жетілді: платформа деплойдалды",
      rows: [
        { text: "Backend: ASP.NET Core, каталог, кітапхана, подписка, admin/operator, i18n." },
        { text: "Frontend: React + Vite, плеер, кітапхана, artist studio, Premium, ru/kk/en." },
        { text: "Жүйе деплойдалды, тесттелді және демоға дайын." },
      ],
      thanks: "Назарларыңызға рахмет!",
      slide: "10 / 10",
    },
    footer: { cta: "SoundBloom ашу" },
  },
};
