import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { useId } from "react";

export interface SegmentedControlItem<T extends string> {
  id: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  items: SegmentedControlItem<T>[];
  value: T;
  onChange: (id: T) => void;

  size?: "xs" | "md";
  variant?: "glass" | "surface";
  /** Классы именно для контейнера с кнопками (layout: flex/grid, media и т.п.) */
  className?: string;
  /** Обёртка снаружи (выравнивание всего блока) */
  wrapperClassName?: string;
}

// Пример расположения в 2 строки
// className="rounded-[18px] grid grid-rows-2 grid-flow-col"

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  variant = "glass",
  className,
  wrapperClassName,
}: SegmentedControlProps<T>) {
  const theme = useAppSelector(selectAppTheme);
  const controlId = useId();

  const height = size === "xs" ? "h-7 text-sm" : "h-10 text-base";
  const padding = size === "xs" ? "px-3 py-1" : "px-4 py-2";

  const containerStyle =
    variant === "glass"
      ? theme === "dark"
        ? "glass-panel-dark"
        : "glass-panel-light"
      : theme === "dark"
      ? "bg-base-content/10"
      : "bg-base-100/60";

  return (
    <div className={cn("inline-flex justify-center", wrapperClassName)}>
      <div
        className={cn(
          "relative p-1 rounded-full gap-1", // базовая геометрия и фон
          containerStyle,
          // layout по умолчанию — одна строка
          "inline-flex items-center",
          // а тут ты можешь переопределить на grid + rows с медиазапросами
          className
        )}
      >
        {items.map((item) => {
          const isActive = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                "relative rounded-full transition-colors cursor-pointer text-nowrap z-10",
                padding,
                height,
                !isActive &&
                  (theme === "light"
                    ? "hover:bg-base-100/40"
                    : "hover:bg-base-content/15")
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={`segmented-control-slide-${controlId}`}
                  className={cn(
                    "absolute inset-0 rounded-full",
                    theme === "light" ? "bg-base-100/70" : "bg-base-content/30"
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 28,
                  }}
                />
              )}
              <span className="relative z-20">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
