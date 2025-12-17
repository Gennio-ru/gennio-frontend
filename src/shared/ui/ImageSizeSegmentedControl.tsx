import {
  PillSegmentedControl,
  PillSegmentedItem,
} from "./PillSegmentedControl";
import { cn } from "@/lib/utils";

const IMAGE_SIZES: PillSegmentedItem<string>[] = [
  { id: "1K", content: "1K — Стандартно" },
  { id: "2K", content: "2K — Высоко" },
  { id: "4K", content: "4K — Максимально" },
];

export interface ImageSizeSegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  size?: "xs" | "md";
  variant?: "glass" | "surface";
  className?: string;
}

export function ImageSizeSegmentedControl({
  value,
  onChange,
  size = "md",
  variant = "glass",
  className,
}: ImageSizeSegmentedControlProps) {
  const items = IMAGE_SIZES;

  const safeValue: string =
    (value && items.some((item) => item.id === value) && value) || items[0]?.id;

  return (
    <PillSegmentedControl<string>
      items={items}
      value={safeValue}
      onChange={onChange}
      size={size}
      variant={variant}
      className={cn("gap-1.5 sm:gap-1.5", className)}
    />
  );
}
