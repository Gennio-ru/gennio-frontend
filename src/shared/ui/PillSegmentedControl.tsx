import { ReactNode, useId } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

export interface PillSegmentedItem<T extends string> {
  id: T;
  content: ReactNode;
}

export interface PillSegmentedControlProps<T extends string> {
  items: PillSegmentedItem<T>[];
  value: T;
  onChange: (id: T) => void;

  size?: "xs" | "md";
  variant?: "glass" | "surface";

  /** Класс для внешней обёртки (nav) */
  wrapperClassName?: string;
  /** Класс для контейнера с кнопками (flex-раскладка и пр.) */
  className?: string;
}

export function PillSegmentedControl<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  variant = "glass",
  wrapperClassName,
  className,
}: PillSegmentedControlProps<T>) {
  const theme = useAppSelector(selectAppTheme);
  const controlId = useId(); // просто чтобы у всех инстансов были разные id если понадобится

  const padding = size === "xs" ? "px-3 py-1 text-sm" : "px-4 py-2 text-base";

  const containerStyle =
    variant === "glass"
      ? theme === "dark"
        ? "glass-panel-dark glass-interactive-dark"
        : "glass-panel-light glass-interactive-light"
      : theme === "dark"
      ? "bg-base-content/10 hover:bg-base-content/20"
      : "bg-base-100/50 hover:bg-base-100/80";

  return (
    <nav
      className={cn(
        "flex justify-center flex-wrap gap-3 sm:gap-4",
        wrapperClassName
      )}
      aria-label={`pill-segmented-${controlId}`}
    >
      <div className={cn("flex flex-wrap gap-3 sm:gap-4", className)}>
        {items.map((item) => {
          const isActive = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "rounded-full transition-all duration-200 cursor-pointer text-nowrap",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "text-base-content/90",
                padding,
                containerStyle,
                isActive && "text-base-content",
                isActive &&
                  variant === "glass" &&
                  (theme === "light" ? "bg-base-100/70" : "bg-base-content/35"),
                isActive &&
                  variant === "surface" &&
                  (theme === "light"
                    ? "bg-base-100 hover:bg-base-100"
                    : "bg-base-content/40 hover:bg-base-content/40")
              )}
            >
              {item.content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
