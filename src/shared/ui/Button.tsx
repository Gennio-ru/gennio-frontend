import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // если используешь clsx/tailwind-merge

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
};

export default function Button({
  className,
  size = "md",
  ...rest
}: ButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "h-8 px-3 text-xs" // чуть меньше
      : "h-10 px-4 text-sm"; // стандарт

  return (
    <button
      {...rest}
      className={cn(
        "rounded-field bg-primary font-medium text-white hover:bg-primary/80 disabled:opacity-70 cursor-pointer",
        sizeClasses,
        className
      )}
    />
  );
}
