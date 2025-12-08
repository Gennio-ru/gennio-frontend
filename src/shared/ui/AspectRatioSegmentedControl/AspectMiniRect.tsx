import { cn } from "@/lib/utils";

interface AspectMiniRectProps {
  /** Логическая ширина (например 2 в "2:3") */
  w: number;
  /** Логическая высота (например 3 в "2:3") */
  h: number;
  /** Размер "рамки" в пикселях (по умолчанию 16x16) */
  boxSize?: number;
  /** Доп. классы для внешней рамки */
  className?: string;
}

/**
 * Небольшой прямоугольник-превью аспекта.
 * Например: <AspectMiniRect w={2} h={3} /> для 2:3.
 */
export function AspectMiniRect({
  w,
  h,
  boxSize = 16,
  className,
}: AspectMiniRectProps) {
  const safeW = w > 0 ? w : 1;
  const safeH = h > 0 ? h : 1;
  const ratio = safeW / safeH;

  let innerWidth: number;
  let innerHeight: number;

  if (ratio >= 1) {
    // ширина больше или равна высоте
    innerWidth = boxSize; // чуть отступы от рамки
    innerHeight = innerWidth / ratio;
  } else {
    // высота больше ширины
    innerHeight = boxSize;
    innerWidth = innerHeight * ratio;
  }

  return (
    <span
      aria-hidden
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: "fit-content", height: boxSize }}
    >
      <div
        className={cn(
          "diagonal-bg flex items-end justify-center rounded-[2px] border border-base-content overflow-hidden"
        )}
        style={{
          width: innerWidth,
          height: innerHeight,
        }}
      />
    </span>
  );
}
