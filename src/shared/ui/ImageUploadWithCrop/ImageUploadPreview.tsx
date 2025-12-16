import { CloudUpload, Repeat, X, ImagePlus } from "lucide-react";
import Button from "../Button";
import { cn } from "@/lib/utils";
import { FileDto } from "@/api/modules/files";
import { useIsTouchDevice } from "@/shared/hooks/useIsTouchDevice";
import IconButton from "../IconButton";
import Loader from "../Loader";
import ImageWithLoader from "../ImageWithLoader";
import { declOfNum } from "@/lib/helpers";

type Props = {
  images: FileDto[];
  theme: string;
  uploadingId?: string | null;

  multiple: boolean;
  maxFiles: number;
  maxFileSizeMb: number;
  canAddMore: boolean;

  stroke: string; // encoded color (%23....) как в аплоадере
  isDragging: boolean;
  isUploading: boolean;

  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;

  onClickAdd: () => void;
  onRemoveAt: (index: number) => void;
};

export const ImageUploadPreview: React.FC<Props> = ({
  images,
  theme,
  uploadingId,
  multiple,
  maxFiles,
  maxFileSizeMb,
  canAddMore,
  stroke,
  isDragging,
  isUploading,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickAdd,
  onRemoveAt,
}) => {
  const isTouch = useIsTouchDevice();

  const countFilesLeft = maxFiles - images.length;

  // SINGLE остаётся как было (оверлей-кнопка)
  if (!multiple) {
    const buttonLabel = "Загрузить новое фото";

    return (
      <div className="flex flex-col gap-2 h-[340px]">
        <div
          className={cn(
            "h-full flex-1 relative group flex items-center justify-center overflow-hidden rounded-field",
            theme === "dark" ? "bg-[#111]" : "bg-[#222]"
          )}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <img
            src={images[0]?.url}
            alt=""
            className="max-w-full max-h-full object-contain transition-opacity duration-200 group-hover:opacity-40"
          />

          {!isTouch && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <Button
                type="button"
                color="ghost"
                bordered
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClickAdd();
                }}
                className="font-thin text-white border-white"
                disabled={isUploading}
              >
                <div className="flex gap-2 items-center">
                  <CloudUpload size={20} stroke="var(--color-white)" />
                  {buttonLabel}
                </div>
              </Button>
            </div>
          )}

          {isTouch && (
            <IconButton
              type="button"
              size="md"
              color="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClickAdd();
              }}
              disabled={isUploading}
              className="absolute top-2 right-2 z-20 bg-base-100/70"
              icon={<Repeat size={20} />}
            />
          )}
        </div>
      </div>
    );
  }

  // MULTIPLE — контейнер как аплоадер: dashed border, без фона.
  return (
    <div className="flex flex-col gap-2 h-[340px]">
      <div
        className={cn(
          "h-full flex-1 relative rounded-field px-4 py-4 transition-colors",
          isDragging && "ring-2 ring-primary/60",
          isUploading && "opacity-70 pointer-events-none"
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8, \
            <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'> \
            <rect x='2' y='2' width='calc(100% - 4px)' height='calc(100% - 4px)' \
            rx='8' ry='8' fill='none' stroke='${stroke}' stroke-width='2' \
            stroke-dasharray='6.5 6' stroke-dashoffset='0' /> \
            </svg>")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
          }}
        >
          {images.map((img, idx) => (
            <div
              key={img.id ?? `${img.url}-${idx}`}
              className="relative group/tile w-full aspect-square max-w-[100px] rounded-field overflow-hidden bg-black/5"
            >
              <ImageWithLoader
                src={img.url}
                alt=""
                size="xs"
                containerClassName={cn(
                  "w-full h-full mx-0 !rounded-field",
                  "max-w-none"
                )}
                className="object-cover"
              />

              {uploadingId && img.id === uploadingId && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-30">
                  <Loader />
                </div>
              )}

              {/* крестик */}
              <div
                className={cn(
                  "absolute top-1 right-1 z-20",
                  !isTouch &&
                    "opacity-0 group-hover/tile:opacity-100 transition-opacity duration-150"
                )}
              >
                <IconButton
                  type="button"
                  size="sm"
                  color="ghost"
                  className="bg-base-100/80 h-6 w-6"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveAt(idx);
                  }}
                  icon={<X size={16} />}
                />
              </div>
            </div>
          ))}

          {/* ПЛЕЙСХОЛДЕР "+", рядом с последним */}
          {canAddMore && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClickAdd();
              }}
              disabled={isUploading}
              className={cn(
                "relative w-full aspect-square max-w-[100px] rounded-field overflow-hidden opacity-50",
                "flex items-center justify-center cursor-pointer",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
              style={{
                backgroundImage: `url("data:image/svg+xml;utf8, \
        <svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'> \
        <rect x='2' y='2' width='calc(100% - 4px)' height='calc(100% - 4px)' \
        rx='8' ry='8' fill='none' stroke='${stroke}' stroke-width='2' \
        stroke-dasharray='6.5 6' stroke-dashoffset='0' /> \
        </svg>")`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "100% 100%",
              }}
              aria-label="Добавить изображение"
            >
              {/* <img
                src={DEFAULT_PLACEHOLDER_IMG}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              /> */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <ImagePlus size={26} stroke="var(--color-base-content)" />
              </div>
            </button>
          )}
        </div>

        {countFilesLeft > 0 && (
          <div className="flex w-full flex-col items-center h-full my-10">
            <div className="text-sm text-base-content/60">
              Можно добавить еще {countFilesLeft}{" "}
              {declOfNum(countFilesLeft, [
                "изображение",
                "изображения",
                "изображений",
              ])}
            </div>

            <div className="mt-1 text-sm text-base-content/60">
              Форматы JPEG, PNG, WEBP не более {maxFileSizeMb} МБ
            </div>
          </div>
        )}

        {countFilesLeft === 0 && (
          <div className="flex w-full flex-col items-center h-full my-10">
            <div className="text-sm text-base-content/60">
              Загружено максимальное количество изображений
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
