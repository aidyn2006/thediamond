import type { Locale } from "@/lib/routes";

/**
 * UI chrome strings for the localised (public) surface.
 *
 * Deliberately NOT a full-app i18n layer: the member area, admin and auth screens stay
 * Russian-only, because they are behind a login and carry no search value. What lives
 * here is exactly what a Kazakh visitor sees on an indexable page.
 *
 * Keep the shape flat and typed — `ui(locale).x` fails to compile if a key is missing
 * from either language, which is the only reliable guard against half-translated pages.
 */

export interface Dict {
  /** <html lang> and the label of the switcher's *other* option. */
  langLabel: string;

  header: {
    nav: string;
    login: string;
    register: string;
    switchTo: string;
  };

  bar: {
    catalogNav: string;
    allPhones: string;
    exchange: string;
    guides: string;
    under100k: string;
    buy: string;
    sell: string;
    modeGroup: string;
  };

  chips: {
    cities: string;
    brands: string;
    allCities: string;
    allPhones: string;
  };

  card: {
    noPhoto: string;
  };

  common: {
    breadcrumbs: string;
    catalog: string;
    empty: string;
    wholeCatalog: string;
    faqTitle: string;
    from: string;
  };

  footer: {
    catalog: string;
    forBuyers: string;
    forSellers: string;
    citiesTitle: string;
    checkBeforeBuying: string;
    checkImei: string;
    howItWorks: string;
    favorites: string;
    sellPhone: string;
    exchangePhone: string;
    rights: string;
  };

  home: {
    title: string;
    description: string;
    h1: string;
    lead: string;
    ctaBrowse: string;
    ctaSell: string;
    newest: string;
    seeAll: string;
    mostViewed: string;
    under: (amount: string) => string;
    citiesHeading: string;
    guidesHeading: string;
    readMinutes: (n: number) => string;
    howHeading: string;
    step: (n: number) => string;
    steps: [string, string][];
  };
}

const ru: Dict = {
  langLabel: "Рус",
  header: {
    nav: "Навигация",
    login: "Войти",
    register: "Начать",
    switchTo: "Қазақша",
  },
  bar: {
    catalogNav: "Категории каталога",
    allPhones: "Все телефоны",
    exchange: "Обмен",
    guides: "Полезное",
    under100k: "До 100 000 ₸",
    buy: "Купить",
    sell: "Продать",
    modeGroup: "Купить или продать",
  },
  chips: {
    cities: "Города",
    brands: "Бренды",
    allCities: "Все города",
    allPhones: "Все телефоны",
  },
  card: { noPhoto: "без фото" },
  common: {
    breadcrumbs: "Хлебные крошки",
    catalog: "Каталог",
    empty: "Пока пусто",
    wholeCatalog: "Весь каталог",
    faqTitle: "Частые вопросы",
    from: "от",
  },
  footer: {
    catalog: "Каталог",
    forBuyers: "Покупателю",
    forSellers: "Продавцу",
    citiesTitle: "Телефоны по городам",
    checkBeforeBuying: "Проверка перед покупкой",
    checkImei: "Проверка IMEI",
    howItWorks: "Как это работает",
    favorites: "Избранное",
    sellPhone: "Продать телефон",
    exchangePhone: "Обменять на другую модель",
    rights: "Телефоны от людей, а не от перекупов",
  },
  home: {
    title: "Телефоны от людей, а не от перекупов",
    description:
      "Маркетплейс телефонов в Казахстане: покупайте у частных продавцов и продавайте свой телефон без комиссии. Каждое объявление проходит проверку.",
    h1: "Телефоны от людей, а не от перекупов",
    lead: "Каждое объявление проходит проверку модератора. Никакой комиссии: договариваетесь напрямую с продавцом и платите при встрече.",
    ctaBrowse: "Смотреть телефоны",
    ctaSell: "Продать свой",
    newest: "Новое поступление",
    seeAll: "Весь каталог",
    mostViewed: "Самые просматриваемые",
    under: (amount) => `До ${amount}`,
    citiesHeading: "Телефоны по городам",
    guidesHeading: "Перед сделкой",
    readMinutes: (n) => `${n} мин чтения`,
    howHeading: "Как это работает",
    step: (n) => `Шаг ${n}`,
    steps: [
      ["Находите телефон", "Бренд, память, состояние и город — в фильтрах каталога."],
      ["Отправляете заявку", "Продавец принимает её и открывает вам свой номер."],
      ["Встречаетесь", "Проверяете телефон и платите на месте — без комиссии сайта."],
    ],
  },
};

const kk: Dict = {
  langLabel: "Қаз",
  header: {
    nav: "Навигация",
    login: "Кіру",
    register: "Бастау",
    switchTo: "Русский",
  },
  bar: {
    catalogNav: "Каталог санаттары",
    allPhones: "Барлық телефондар",
    exchange: "Айырбас",
    guides: "Пайдалы",
    under100k: "100 000 ₸ дейін",
    buy: "Сатып алу",
    sell: "Сату",
    modeGroup: "Сатып алу немесе сату",
  },
  chips: {
    cities: "Қалалар",
    brands: "Брендтер",
    allCities: "Барлық қалалар",
    allPhones: "Барлық телефондар",
  },
  card: { noPhoto: "фотосыз" },
  common: {
    breadcrumbs: "Навигация жолы",
    catalog: "Каталог",
    empty: "Әзірге бос",
    wholeCatalog: "Толық каталог",
    faqTitle: "Жиі қойылатын сұрақтар",
    from: "бастап",
  },
  footer: {
    catalog: "Каталог",
    forBuyers: "Сатып алушыға",
    forSellers: "Сатушыға",
    citiesTitle: "Қалалар бойынша телефондар",
    checkBeforeBuying: "Сатып алар алдында тексеру",
    checkImei: "IMEI тексеру",
    howItWorks: "Бұл қалай жұмыс істейді",
    favorites: "Таңдаулылар",
    sellPhone: "Телефон сату",
    exchangePhone: "Басқа модельге айырбастау",
    rights: "Телефондар — делдалдардан емес, адамдардан",
  },
  home: {
    title: "Телефондар — делдалдардан емес, адамдардан",
    description:
      "Қазақстандағы телефон маркетплейсі: жеке сатушылардан сатып алыңыз және өз телефоныңызды комиссиясыз сатыңыз. Әр хабарландыру модерациядан өтеді.",
    h1: "Телефондар — делдалдардан емес, адамдардан",
    lead: "Әр хабарландыруды модератор тексереді. Комиссия жоқ: сатушымен тікелей келісесіз және кездескен жерде төлейсіз.",
    ctaBrowse: "Телефондарды қарау",
    ctaSell: "Өз телефонымды сату",
    newest: "Жаңа түскендер",
    seeAll: "Толық каталог",
    mostViewed: "Ең көп қаралғандар",
    under: (amount) => `${amount} дейін`,
    citiesHeading: "Қалалар бойынша телефондар",
    guidesHeading: "Мәміле алдында",
    readMinutes: (n) => `${n} мин оқу`,
    howHeading: "Бұл қалай жұмыс істейді",
    step: (n) => `${n}-қадам`,
    steps: [
      [
        "Телефон таңдайсыз",
        "Бренд, жады, күйі және қала — каталог сүзгілерінде.",
      ],
      [
        "Өтініш жібересіз",
        "Сатушы оны қабылдайды және сізге нөмірін ашады.",
      ],
      [
        "Кездесесіз",
        "Телефонды тексеріп, сол жерде төлейсіз — сайт комиссиясыз.",
      ],
    ],
  },
};

const DICTS: Record<Locale, Dict> = { ru, kk };

export function ui(locale: Locale): Dict {
  return DICTS[locale];
}
