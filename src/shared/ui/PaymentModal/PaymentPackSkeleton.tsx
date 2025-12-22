import { cn } from "@/lib/utils";

export function PaymentPackSkeleton() {
  return (
    <div
      className={cn(
        "rounded-selector p-4 flex justify-between items-center gap-4",
        "bg-base-200/60 animate-pulse"
      )}
    >
      {/* Левая часть */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-24 rounded bg-base-content/15" />
        <div className="h-3 w-40 rounded bg-base-content/10" />
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-4">
        <div className="h-5 w-14 rounded bg-base-content/15" />
        <div className="h-4 w-4 rounded-full bg-base-content/20" />
      </div>
    </div>
  );
}
