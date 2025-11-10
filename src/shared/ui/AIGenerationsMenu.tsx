import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { aiGenerationsMenu } from "../config/menu";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

export type NavItem = { label: string; href: string };

export function AIGenerationsMenu() {
  const theme = useAppSelector(selectAppTheme);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex flex-wrap gap-2 sm:gap-4 pt-2 sm:pt-5 pb-7 sm:pb-10">
      {aiGenerationsMenu.map((item) => {
        const isActive = location.pathname === item.href;

        return (
          <button
            key={item.href}
            onClick={() => navigate(item.href)}
            className={cn(
              "px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-base sm:text-base transition-all duration-200",
              "text-base-content/90 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isActive && "text-base-content",
              // Активный пункт (разные фоны для тем)
              isActive &&
                (theme === "light" ? "bg-base-100/70" : "bg-base-content/35"),
              theme === "dark"
                ? "glass-panel-dark glass-interactive-dark"
                : "glass-panel-light glass-interactive-light"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
