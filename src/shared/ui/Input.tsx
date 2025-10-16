import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  errored?: boolean;
}

export default function Input({ errored, className, ...props }: Props) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-field bg-base-200 text-base-content px-3 text-base",
        "focus:outline-none appearance-none transition-colors placeholder:text-base-content/60",
        errored && "border-b border-b-[var(--color-error)]!",
        className
      )}
    />
  );
}
