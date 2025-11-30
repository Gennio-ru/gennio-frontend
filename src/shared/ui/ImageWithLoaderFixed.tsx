import { cn } from "@/lib/utils";
import { useState } from "react";

type ImageWithLoaderFixedProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Классы для контейнера (задаёшь фиксированный размер тут) */
  containerClassName?: string;
};

export default function ImageWithLoaderFixed({
  containerClassName,
  className,
  ...imgProps
}: ImageWithLoaderFixedProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-selector",
        containerClassName
      )}
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
          "h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}
