type ImageThumbProps = {
  label?: string;
  url: string | null;
};

export default function ImageThumb({ label, url }: ImageThumbProps) {
  if (!url) {
    return (
      <div className="flex flex-col items-center gap-1 text-xs text-base-content/60 w-[96px]">
        {label && <span>{label}</span>}
        <div className="w-20 h-20 rounded-box flex items-center justify-center text-[10px] text-base-content/40">
          нет
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 text-xs text-base-content/70 w-[96px]">
      {label && <span>{label}</span>}
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={label}
          className="w-20 h-20 rounded-box object-cover"
        />
      </a>
    </div>
  );
}
