import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectAppTheme, setAppTheme } from "@/features/app/appSlice";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "theme";

export default function ThemeSwitch() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectAppTheme);

  // Инициализация темы один раз при монтировании компонента
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;

    if (saved) {
      dispatch(setAppTheme(saved));
      return;
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    dispatch(setAppTheme(prefersDark ? "dark" : "light"));
  }, [dispatch]);

  // Сайд-эффекты при смене темы (DOM + localStorage)
  useEffect(() => {
    if (!theme) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    dispatch(setAppTheme(next));
  };

  return (
    <button
      onClick={toggle}
      className={`
        relative w-12 min-w-12 h-7 flex items-center rounded-full p-1 cursor-pointer
        overflow-hidden transition-colors duration-300 border-base-content/20 border-[1px]
      `}
    >
      <div
        className={`
          flex items-center gap-1 w-[150%]
          transition-transform duration-300
          ${theme === "dark" ? "translate-x-[-1px]" : "-translate-x-[20px]"}
        `}
      >
        <Sun className="w-4 h-4 text-yellow-400 shrink-0" />

        <span
          className={`
            w-5 h-5 rounded-full transform
            transition-transform duration-300 shrink-0
            ${theme === "dark" ? "bg-stone-400" : "bg-base-100"}
          `}
        />

        <Moon className="w-4 h-4 text-slate-600 shrink-0" />
      </div>
    </button>
  );
}
