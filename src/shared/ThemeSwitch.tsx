import { useEffect, useState } from "react";

const THEME_KEY = "theme";

export default function ThemeSwitch() {
  const [isDark, setIsDark] = useState(false);

  // при монтировании смотрим localStorage и системные настройки
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      setIsDark(saved === "dark");
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // обновляем тему при изменении
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((p) => !p)}
      className={`
        relative w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300
        ${isDark ? "bg-stone-700" : "bg-stone-300"}
      `}
    >
      <span
        className={`
          w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
          ${isDark ? "translate-x-4" : "translate-x-0"}
        `}
      />
    </button>
  );
}
