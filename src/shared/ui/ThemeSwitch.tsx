import { setAppTheme } from "@/features/app/appSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

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
