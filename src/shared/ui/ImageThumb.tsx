import { cn } from "@/lib/utils";

type ImageThumbProps = {
  label?: string;
  url: string | null;
  className?: string;
  imgClassName?: string;
};

export default function ImageThumb({
  label,
  url,
  className,
  imgClassName,
}: ImageThumbProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-xs",
        url ? "text-base-content/70" : "text-base-content/60",
        className
      )}
    >
      {label && <span>{label}</span>}

      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={label ?? "image"}
            loading="lazy"
            className={cn("w-20 h-20 rounded-box object-cover", imgClassName)}
          />
        </a>
      ) : (
        <div className="w-20 h-20 rounded-box flex items-center justify-center text-[10px] text-base-content/40">
          нет
        </div>
      )}
    </div>
  );
}
