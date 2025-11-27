import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

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
  className?: string;
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  variant = "glass",
  className,
}: SegmentedControlProps<T>) {
  const theme = useAppSelector(selectAppTheme);

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
    <div className={cn("inline-flex justify-center", className)}>
      <div
        className={cn(
          "relative inline-flex items-center rounded-full p-1 gap-1",
          containerStyle
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
                  layoutId="segmented-control-slide"
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
