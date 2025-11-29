import { FileDto } from "@/api/modules/files";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ResultImageWithPreviewProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  file?: FileDto;
  /** Классы для контейнера (задаёшь фиксированный размер тут) */
  containerClassName?: string;
  /** Любые элементы, выводимые поверх картинки */
  children?: React.ReactNode;
};

export default function ResultImageWithPreview({
  containerClassName,
  className,
  children,
  ...imgProps
}: ResultImageWithPreviewProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative rounded-selector", containerClassName)}>
      {/* Скелетон */}
      {!loaded && (
        <div className="absolute rounded-selector inset-0 animate-pulse bg-base-300/50" />
      )}

      {/* Картинка */}
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
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />

      {/* Контент поверх картинки */}
      {children && (
        <div className="absolute inset-0 pointer-events-none">{children}</div>
      )}
    </div>
  );
}
