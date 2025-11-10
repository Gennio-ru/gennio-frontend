import { cn } from "@/lib/utils";
import { useState } from "react";
import Loader from "./Loader";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  loaderSize?: number;
  size?: "xs" | "md" | "xl";
};

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-[150px] min-w-[80px]",
  md: "h-[350px] min-w-[140px]",
  xl: "h-[500px] min-w-[200px]",
};

export default function ImageWithLoader({ size = "xl", ...props }: Props) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader />
        </div>
      )}

      <img
        {...props}
        onLoad={(e) => {
          setLoading(false);
          props.onLoad?.(e);
        }}
        onError={(e) => {
          setLoading(false);
          props.onError?.(e);
        }}
        className={cn(
          "w-auto rounded-field object-contain transition-opacity duration-300",
          sizeClasses[size],
          loading ? "opacity-0" : "opacity-100",
          props.className
        )}
      />
    </div>
  );
}
