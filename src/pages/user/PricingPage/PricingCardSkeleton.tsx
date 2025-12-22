import { cn } from "@/lib/utils";
import GlassCard from "@/shared/ui/GlassCard";

export function PricingCardSkeleton() {
  return (
    <GlassCard
      className={cn(
        "px-4 pt-5 pb-4 rounded-selector min-[1024px]:min-h-[300px]",
        "flex flex-col justify-between gap-9 max-w-sm w-full mx-auto",
        "animate-pulse"
      )}
    >
      <div>
        {/* Название */}
        <div className="h-5 w-32 mx-auto rounded bg-base-content/10" />

        {/* Подзаголовок */}
        <div className="mt-3 h-4 w-40 mx-auto rounded bg-base-content/10" />

        {/* Количество токенов */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="h-7 w-20 rounded bg-base-content/15" />
          <div className="h-4 w-24 rounded bg-base-content/10" />
        </div>

        {/* Бонус */}
        <div className="mt-6 h-4 w-32 mx-auto rounded bg-base-content/10" />
      </div>

      {/* Кнопка */}
      <div className="h-12 w-full rounded-field bg-base-content/15" />
    </GlassCard>
  );
}
