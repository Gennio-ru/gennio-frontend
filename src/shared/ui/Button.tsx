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
  const sizeClasses =
    size === "sm" ? "h-8 px-3 text-sm" : "h-12 px-4 text-base";

  const colorClasses =
    color === "primary"
      ? "bg-primary text-primary-content hover:bg-primary/80"
      : color === "secondary"
      ? "bg-secondary text-secondary-content hover:bg-secondary/80"
      : "text-base-content";

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "rounded-field font-medium disabled:opacity-70 cursor-pointer focus:outline-none focus:ring-0",
        "transition-colors duration-200 ease-in-out",
        sizeClasses,
        colorClasses,
        bordered && "border border-base-content/60",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center gap-1",
          contentClassName
        )}
      >
        {/* текст и children остаются нетронутыми */}
        {children}

        {/* лоадер справа — как у тебя в примере */}
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
