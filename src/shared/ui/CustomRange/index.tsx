import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

import "./index.css";

type CustomRangeProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean; // ← добавили
};

export function CustomRange({
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  disabled = false,
}: CustomRangeProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={(e) => !disabled && onChange(Number(e.target.value))}
      className={cn(
        "range-custom w-full",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
      style={{ "--value": `${percent}%` } as CSSProperties}
    />
  );
}
