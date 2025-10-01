import { useEffect, useState } from "react";

const THEME_KEY = "theme";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // при монтировании читаем localStorage и системные настройки
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const init = prefersDark ? "dark" : "light";
      setTheme(init);
      document.documentElement.setAttribute("data-theme", init);
    }
  }, []);

  // обновляем тему при изменении
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
      className={`
    relative w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300
    ${theme === "dark" ? "bg-base-200" : "bg-neutral-300"}
  `}
    >
      <span
        className={`
      w-4 h-4 ${
        theme === "dark" ? "bg-stone-400" : "bg-neutral-400"
      } rounded-full transform transition-transform duration-300
      ${theme === "dark" ? "translate-x-4" : "translate-x-0"}
    `}
      />
    </button>
  );
}
