import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // если используешь clsx/tailwind-merge

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  color?: "primary" | "secondary" | "ghost";
};

export default function Button({
  className,
  size = "md",
  color = "primary",
  ...rest
}: ButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs" // чуть меньше
      : "h-12 px-4 text-base"; // стандарт

  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-content hover:bg-primary/80"
      : color === "secondary"
      ? "bg-secondary text-secondary-content hover:bg-secondary/80"
      : // ghost
        "text-base-content";

  return (
    <button
      {...rest}
      className={cn(
        "rounded-field font-medium disabled:opacity-70 cursor-pointer",
        sizeClasses,
        colorClasses,
        className
      )}
    />
  );
}
