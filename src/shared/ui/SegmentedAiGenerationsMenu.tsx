import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { aiGenerationsMenu } from "../config/menu";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { motion } from "framer-motion";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export interface Props {
  className?: string;
}

export function SegmentedAIGenerationsMenu({ className }: Props) {
  const theme = useAppSelector(selectAppTheme);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  return (
    <div className={cn("flex justify-center pt-3 md:pt-5 pb-7", className)}>
      <div
        className={cn(
          "relative inline-flex items-center rounded-full p-1 gap-1",
          theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
        )}
      >
        {aiGenerationsMenu.map((item) => {
          const isActive =
            currentPath === item.href ||
            currentPath.startsWith(item.href + "/");

          const handleClick = () => {
            if (item.external) window.open(item.href, "_blank");
            else navigate(item.href);
          };

          return (
            <button
              key={item.href}
              onClick={handleClick}
              className={cn(
                "relative px-4 py-2 rounded-full text-base transition-colors cursor-pointer text-nowrap",
                !isActive &&
                  (theme === "light"
                    ? "hover:bg-base-100/40"
                    : "hover:bg-base-content/15"),
                "z-10"
              )}
            >
              {/* Подложка-ползунок */}
              {isActive && (
                <motion.div
                  layoutId="segmented-slide"
                  className={cn(
                    "absolute inset-0 rounded-full",
                    theme === "light" ? "bg-base-100/70" : "bg-base-content/35"
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              {/* Текст */}
              <span className="relative z-20">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
