import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import loaderAnimation from "@/assets/loader.json";

type LoaderProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
};

const sizeMap: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "w-6 h-6", // немного больше, чтобы анимация не терялась
  md: "w-10 h-10",
  lg: "w-16 h-16",
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
      <Lottie
        animationData={loaderAnimation}
        loop
        className={cn(sizeMap[size], className)}
        aria-label="Загрузка"
      />
      <span className="sr-only">Загрузка…</span>
    </div>
  );
}
