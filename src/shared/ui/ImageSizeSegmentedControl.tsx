import { PROVIDER_COST_OBJECT } from "@/api/modules/pricing";
import {
  PillSegmentedControl,
  PillSegmentedItem,
} from "./PillSegmentedControl";
import { cn } from "@/lib/utils";

const { standard: standardPrice, high: highPrice } =
  PROVIDER_COST_OBJECT["GEMINI"]["edit"];
const highResolutionPrice = highPrice - standardPrice;

const IMAGE_SIZES: PillSegmentedItem<string>[] = [
  { id: "1K", content: <span className="text-base">1K — Стандартно</span> },
  { id: "2K", content: <span className="text-base">2K — Высоко</span> },
  {
    id: "4K",
    content: (
      <span className="text-base">
        4K — Максимально&nbsp;&nbsp;
        <span className="text-warning">+{highResolutionPrice} токенов</span>
      </span>
    ),
  },
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
      className={cn("gap-1.5 sm:gap-1.5 text-base", className)}
    />
  );
}
