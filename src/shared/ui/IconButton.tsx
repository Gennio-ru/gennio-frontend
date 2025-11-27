import { ButtonHTMLAttributes, ReactElement } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  icon: ReactElement;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "ghost" | "glass";
};

export default function IconButton({
  icon,
  className,
  size = "md",
  color = "primary",
  ...rest
}: IconButtonProps) {
  const theme = useAppSelector(selectAppTheme);

  const sizeClasses =
    size === "sm"
      ? "h-8 w-8 text-sm"
      : size === "lg"
      ? "h-14 w-14 text-xl"
      : "h-10 w-10 text-base";

  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-content hover:bg-primary/80"
      : color === "ghost"
      ? "text-base-content hover:bg-base-200/40"
      : // glass
        cn(
          "text-base-content shadow-lg",
          theme === "light"
            ? "glass-panel-light glass-interactive-light"
            : "glass-panel-dark glass-interactive-dark"
        );

  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "flex items-center justify-center rounded-full font-medium transition-all",
        "duration-150 disabled:opacity-60 active:scale-95 cursor-pointer",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      {icon}
    </button>
  );
}
