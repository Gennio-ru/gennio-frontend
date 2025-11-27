import { cn } from "@/lib/utils";

type RadioDotProps = {
  active: boolean;
  className?: string;
};

export function RadioDot({ active, className }: RadioDotProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
        active ? "border-primary" : "border-base-content/50",
        className
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full bg-primary transition-transform duration-200",
          active ? "scale-100" : "scale-0"
        )}
      />
    </span>
  );
}
