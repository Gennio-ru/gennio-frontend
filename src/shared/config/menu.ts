export type NavItem = { label: string; href: string; external?: boolean };

export const primaryMenu: NavItem[] = [
  { label: "Готовые промпты", href: "/prompts" },
  { label: "Сгенерировать", href: "/model-generate" },
  { label: "Обработать", href: "/model-job" },
];

export const socialsMenu: NavItem[] = [
  // { label: "Telegram", href: "https://t.me/xxx", external: true },
  // { label: "YouTube", href: "https://youtube.com/@xxx", external: true },
  // { label: "VK", href: "https://vk.com/xxx", external: true },
  // { label: "Дзен", href: "https://dzen.ru/xxx", external: true },
];

export const secondaryMenu: NavItem[] = [
  // { label: "Контакты", href: "/contacts" },
  // { label: "Реклама", href: "/ads" },
  // { label: "О проекте", href: "/about" },
];
