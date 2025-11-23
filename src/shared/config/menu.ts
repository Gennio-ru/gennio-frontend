export type NavItem = { label: string; href: string; external?: boolean };

export const primaryHeaderMenu: NavItem[] = [
  { label: "AI Генерация", href: "/prompts" },
  { label: "Тарифы", href: "/pricing" },
  { label: "О проекте", href: "/about" },
];

export const adminHeaderMenu: NavItem[] = [
  { label: "Промпты", href: "/admin/prompts" },
  { label: "Категории", href: "/admin/categories" },
  { label: "Платежи", href: "/admin/payments" },
  { label: "Пользователи", href: "/admin/users" },
  { label: "Генерации", href: "/admin/model-jobs" },
  { label: "Транзакции", href: "/admin/transactions" },
];

export const aiGenerationsMenu: NavItem[] = [
  { label: "Готовые шаблоны", href: "/prompts" },
  { label: "Генерация картинок", href: "/generate-image" },
  { label: "Обработка фото", href: "/edit-image" },
];
