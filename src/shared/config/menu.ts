import { AppRoute } from "./routes";

export type NavItem = {
  label: string;
  href: AppRoute | string;
  external?: boolean;
};

export const primaryHeaderMenu: NavItem[] = [
  { label: "AI Генерация", href: AppRoute.PROMPTS },
  { label: "Тарифы", href: AppRoute.PRICING },
  { label: "О проекте", href: AppRoute.ABOUT },
];

export const adminHeaderMenu: NavItem[] = [
  { label: "Промпты", href: AppRoute.ADMIN_PROMPTS },
  { label: "Категории", href: AppRoute.ADMIN_CATEGORIES },
  { label: "Платежи", href: AppRoute.ADMIN_PAYMENTS },
  { label: "Пользователи", href: AppRoute.ADMIN_USERS },
  { label: "Генерации", href: AppRoute.ADMIN_JOBS },
  { label: "Транзакции", href: AppRoute.ADMIN_TRANSACTIONS },
];

export const aiGenerationsMenu: NavItem[] = [
  { label: "Готовые шаблоны", href: AppRoute.PROMPTS },
  { label: "Создание с нуля", href: AppRoute.GENERATE_IMAGE },
  { label: "Обработка фото", href: AppRoute.EDIT_IMAGE },
];
