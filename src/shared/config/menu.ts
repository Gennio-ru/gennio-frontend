export type NavItem = { label: string; href: string; external?: boolean };

export const primaryMenu: NavItem[] = [
  { label: "Готовые промпты", href: "/prompts" },
  { label: "Сгенерировать", href: "/generate-image" },
  { label: "Обработать", href: "/edit-image" },
];

export const adminMenu: NavItem[] = [
  { label: "Промпты", href: "/admin/prompts" },
  { label: "Категории", href: "/admin/categories" },
];
