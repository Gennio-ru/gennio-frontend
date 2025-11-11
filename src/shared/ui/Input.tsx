import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errored?: boolean;
  errorMessage?: string;
}

export default function Input({
  errored,
  errorMessage,
  className,
  ...props
}: Props) {
  const hasError = errored || !!errorMessage;

  return (
    <div className="relative w-full">
      <input
        {...props}
        className={cn(
          "h-12 w-full rounded-field bg-base-200 text-base-content px-3 text-base",
          "focus:outline-none appearance-none transition-colors placeholder:text-base-content/60",
          hasError && "border-b border-b-[var(--color-error)]!",
          className
        )}
      />

      {errorMessage && (
        <div className="pointer-events-none absolute left-0 top-full mt-1 text-xs text-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
