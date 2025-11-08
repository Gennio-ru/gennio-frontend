export type NavItem = { label: string; href: string; external?: boolean };

export const primaryMenu: NavItem[] = [
  { label: "AI Генерация", href: "/prompts" },
  { label: "Тарифы", href: "/billing" },
  { label: "О проекте", href: "/about-project" },
];

export const adminMenu: NavItem[] = [
  { label: "Промпты", href: "/admin/prompts" },
  { label: "Категории", href: "/admin/categories" },
];
