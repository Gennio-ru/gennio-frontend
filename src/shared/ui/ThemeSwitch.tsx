import { setAppTheme } from "@/features/app/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Sun, Moon } from "lucide-react";

const THEME_KEY = "theme";

export default function ThemeSwitch() {
  const dispatch = useDispatch();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    if (saved) return saved;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    dispatch(setAppTheme(theme));
  }, [theme, dispatch]);

  const toggle = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <button
      onClick={toggle}
      className={`
        relative w-12 h-7 flex items-center rounded-full p-1
        overflow-hidden transition-colors duration-300
        ${theme === "dark" ? "bg-base-200" : "bg-neutral-300"}
      `}
    >
      <div
        className={`
          flex items-center gap-1 w-[150%]
          transition-transform duration-300
          ${theme === "dark" ? "translate-x-0" : "-translate-x-5"}
        `}
      >
        <Sun className="w-4 h-4 text-yellow-400 shrink-0" />

        <span
          className={`
            w-5 h-5 rounded-full transform
            transition-transform duration-300 shrink-0
            ${theme === "dark" ? "bg-stone-400" : "bg-neutral-400"}
          `}
        />

        <Moon className="w-4 h-4 text-slate-600 shrink-0" />
      </div>
    </button>
  );
}
