import { ModelType } from "@/api/modules/model-job";
import { PillSegmentedControl } from "../PillSegmentedControl";
import {
  AspectRatioValue,
  GEMINI_ASPECT_ITEMS,
  OPENAI_ASPECT_ITEMS,
} from "./items";

import "./index.css";
import { cn } from "@/lib/utils";

export interface AspectRatioSegmentedControlProps {
  model: ModelType;
  value: AspectRatioValue;
  onChange: (value: AspectRatioValue) => void;
  size?: "xs" | "md";
  variant?: "glass" | "surface";
  className?: string;
}

export function AspectRatioSegmentedControl({
  model,
  value,
  onChange,
  size = "md",
  variant = "glass",
  className,
}: AspectRatioSegmentedControlProps) {
  const items =
    model === ModelType.GEMINI ? GEMINI_ASPECT_ITEMS : OPENAI_ASPECT_ITEMS;

  const safeValue: AspectRatioValue =
    (value && items.some((item) => item.id === value) && value) || items[0]?.id;

  return (
    <PillSegmentedControl<AspectRatioValue>
      items={items}
      value={safeValue}
      onChange={onChange}
      size={size}
      variant={variant}
      className={cn("gap-1.5 sm:gap-1.5", className)}
    />
  );
}
