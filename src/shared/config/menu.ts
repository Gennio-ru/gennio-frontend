export type NavItem = { label: string; href: string; external?: boolean };

export const primaryMenu: NavItem[] = [
  { label: "Готовые промпты", href: "/prompts" },
  { label: "Сгенерировать", href: "/model-generate" },
  { label: "Обработать", href: "/model-job" },
];
