import { cn } from "@/lib/utils";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
};

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "w-4 h-4", // 16px
  md: "w-6 h-6", // 24px
  lg: "w-10 h-10", // 40px
};

export default function Loader({
  size = "md",
  className,
  containerClassName,
}: LoaderProps) {
  return (
    <div
      className={cn("w-full flex justify-center py-8 my-8", containerClassName)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className={cn(
          "loading loading-spinner text-base-content/50",
          sizeMap[size],
          className
        )}
        aria-label="Загрузка"
      />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
