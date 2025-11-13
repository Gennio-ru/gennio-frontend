import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  size?: "xs" | "md" | "xl";
  widthPx?: number | null;
  heightPx?: number | null;
};

const baseSide: Record<NonNullable<Props["size"]>, number> = {
  xs: 150,
  md: 350,
  xl: 500,
};

// канонические соотношения сторон
const RATIO_SQUARE = 1; // 1024x1024
const RATIO_PORTRAIT = 1024 / 1536; // ~0.666...
const RATIO_LANDSCAPE = 1536 / 1024; // 1.5

function getCanonicalRatio(w?: number | null, h?: number | null) {
  if (!w || !h || w <= 0 || h <= 0) return RATIO_SQUARE;

  const actual = w / h;

  const candidates = [
    { ratio: RATIO_SQUARE, diff: Math.abs(actual - RATIO_SQUARE) },
    { ratio: RATIO_PORTRAIT, diff: Math.abs(actual - RATIO_PORTRAIT) },
    { ratio: RATIO_LANDSCAPE, diff: Math.abs(actual - RATIO_LANDSCAPE) },
  ];

  candidates.sort((a, b) => a.diff - b.diff);
  return candidates[0].ratio;
}

export default function ImageWithLoader({
  size = "xl",
  widthPx,
  heightPx,
  className,
  ...imgProps
}: Props) {
  const [loaded, setLoaded] = useState(false);

  const ratio = getCanonicalRatio(widthPx, heightPx);
  const base = baseSide[size];

  // для landscape делаем ширину больше, для портрета — base
  const maxWidthPx = ratio >= 1 ? base * ratio : base;

  return (
    <div
      className="relative overflow-hidden rounded-field mx-auto"
      style={{
        width: "100%",
        maxWidth: maxWidthPx,
        aspectRatio: ratio,
        maxHeight: base,
      }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-base-300/50" />
      )}

      <img
        {...imgProps}
        onLoad={(e) => {
          setLoaded(true);
          imgProps.onLoad?.(e);
        }}
        onError={(e) => {
          setLoaded(true);
          imgProps.onError?.(e);
        }}
        className={cn(
          "h-full w-full object-contain transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
