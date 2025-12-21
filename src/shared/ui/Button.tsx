import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import spinnerAnimation from "@/assets/loader-white.json";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
  color?: "primary" | "secondary" | "ghost";
  bordered?: boolean;
  loading?: boolean;
  contentClassName?: string;
};

export default function Button({
  className,
  contentClassName,
  size = "md",
  color = "primary",
  bordered = false,
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const sizeClasses =
    size === "sm" ? "h-8 px-3 text-sm" : "h-12 px-4 text-base";

  // Важно: hover только если НЕ disabled
  const colorClasses =
    color === "primary"
      ? cn(
          "bg-primary text-primary-content",
          !isDisabled && "hover:bg-primary/80"
        )
      : color === "secondary"
      ? cn(
          "bg-secondary text-secondary-content",
          !isDisabled && "hover:bg-secondary/80"
        )
      : cn("text-base-content", !isDisabled && "hover:bg-base-200/40");

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        "rounded-field font-medium focus:outline-none focus:ring-0",
        "transition-colors duration-200 ease-in-out",
        sizeClasses,
        colorClasses,

        bordered && "border border-base-content/60",

        // disabled поведение
        isDisabled
          ? "cursor-not-allowed opacity-60 pointer-events-none"
          : "cursor-pointer",

        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-1",
          contentClassName
        )}
      >
        {children}

        {loading && (
          <Lottie
            animationData={spinnerAnimation}
            loop
            className="w-6 h-6 ml-2"
          />
        )}
      </div>
    </button>
  );
}
