import i18n from "@/shared/config/i18n/index";

export function translateErrorCode(code: string): string {
  const key = `errors.${code}`;
  const translated = i18n.t(key);

  // если перевода нет — вернём сам code
  if (!translated || translated === key) {
    return code;
  }

  return translated;
}
