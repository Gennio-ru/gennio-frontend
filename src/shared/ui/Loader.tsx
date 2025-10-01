import { cn } from "@/lib/utils";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "w-4 h-4", // 16px
  md: "w-6 h-6", // 24px
  lg: "w-10 h-10", // 40px
};

export default function Loader({ size = "md", className }: LoaderProps) {
  return (
    <span
      className={cn(
        "loading loading-spinner text-base-content/50",
        sizeMap[size],
        className
      )}
    />
  );
}
