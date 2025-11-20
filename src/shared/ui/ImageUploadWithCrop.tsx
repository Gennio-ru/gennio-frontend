import { UploadFileResponse } from "@/api/modules/files";
import React, { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import IconButton from "./IconButton";
import { CloudUpload, XIcon } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import { SegmentedControl } from "./SegmentedControl";
import Button from "./Button";
import { CustomRange } from "./CustomRange";
import Loader from "./Loader";

type ImageUploadWithCropProps = {
  /** Колбек, который получит уже обрезанный файл и вернёт данные сохранённого изображения */
  onUpload: (file: File) => Promise<UploadFileResponse> | UploadFileResponse;
  /** Разрешённые mime-типы, по умолчанию только картинки */
  accept?: string;
  /** Макс. размер файла (МБ) */
  maxFileSizeMb?: number;
  /** Начальный пресет (portrait/square/landscape) */
  initialAspectPreset?: "portrait" | "square" | "landscape";
  /** Название файла по умолчанию при сохранении */
  outputFileName?: string;
  /** Опционально: колбек для удаления файла на бэке (DB/S3) */
  onRemove?: (file: UploadFileResponse) => Promise<void> | void;
};

const ASPECT_PRESETS = [
  {
    id: "portrait" as const,
    label: "1 : 1.5",
    value: 1 / 1.5, // width:height → ~0.666...
  },
  {
    id: "square" as const,
    label: "1 : 1",
    value: 1,
  },
  {
    id: "landscape" as const,
    label: "1.5 : 1",
    value: 1.5,
  },
];

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onUpload,
  accept = "image/*",
  maxFileSizeMb = 10,
  initialAspectPreset = "square",
  outputFileName = "cropped-image.jpg",
  onRemove,
}) => {
  const theme = useAppSelector(selectAppTheme);

  const [step, setStep] = useState<"idle" | "cropping" | "uploading">("idle");
  const [error, setError] = useState<string | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [aspectPresetId, setAspectPresetId] = useState<
    "portrait" | "square" | "landscape"
  >(initialAspectPreset);

  const [previewImage, setPreviewImage] = useState<UploadFileResponse | null>(
    null
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const currentAspect =
    ASPECT_PRESETS.find((p) => p.id === aspectPresetId)?.value ?? 1;

  // --- Общая обработка файла (и для input, и для dnd) ---
  const processFile = async (file: File) => {
    setError(null);

    // 1. Валидация
    try {
      validateFile(file, maxFileSizeMb, accept);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный файл");
      return;
    }

    // 2. Читаем в dataURL для кроппера
    try {
      const dataUrl = await fileToDataURL(file);
      setOriginalFile(file);
      setImageSrc(dataUrl);
      setStep("cropping");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      setError("Не удалось прочитать файл");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    e.target.value = ""; // сброс инпута
  };

  // --- Drag & Drop ---

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processFile(file);
  };

  // --- Cropper ---

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );

  const handleCancel = () => {
    setImageSrc(null);
    setOriginalFile(null);
    setStep("idle");
    setError(null);
  };

  const handleRemove = async () => {
    if (!previewImage) return;

    try {
      // если передан onRemove — даём возможности бэку удалить файл
      if (onRemove) {
        await onRemove(previewImage);
      }

      // локально убираем превью и возвращаем аплоадер
      setPreviewImage(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Не удалось удалить изображение");
    }
  };

  const handleConfirm = async () => {
    if (step === "uploading") {
      return;
    }

    if (!imageSrc || !croppedAreaPixels || !originalFile) return;

    setError(null);
    setStep("uploading");

    try {
      const blob = await getCroppedBlob(
        imageSrc,
        croppedAreaPixels,
        "image/jpeg",
        0.9
      );
      const file = new File([blob], outputFileName, { type: blob.type });

      // onUpload возвращает UploadedImage
      const uploaded = await Promise.resolve(onUpload(file));

      // сохраняем данные загруженной картинки для превью
      setPreviewImage(uploaded);

      // сбрасываем кроппер и возвращаемся к idle
      setStep("idle");
      setImageSrc(null);
      setOriginalFile(null);
    } catch (err) {
      console.error(err);
      setError("Ошибка при обработке или загрузке файла");
      setStep("cropping"); // даём возможность попробовать ещё раз
    }
  };

  const handleAspectChange = (id: "portrait" | "square" | "landscape") => {
    setAspectPresetId(id);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const stroke = theme === "dark" ? "%23CBD0DC" : "%237d7f84";

  return (
    <div>
      {/* Превью загруженного изображения */}
      {previewImage && (
        <div className="flex flex-col gap-2 h-[300px]">
          <div className="h-full flex-1 relative flex items-center justify-center overflow-hidden bg-base-100 rounded-field">
            {/* Кнопка удаления внутри превью */}
            <IconButton
              type="button"
              size="sm"
              color="ghost"
              onClick={handleRemove}
              icon={<XIcon />}
              className="absolute top-2 right-2 z-20 bg-base-100/70 hover:bg-base-100 shadow-sm"
            />

            {/* Изображение */}
            <img
              src={previewImage.url}
              alt=""
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Шаг выбора файла + Drag & Drop — показываем ТОЛЬКО если превью ещё нет */}
      {!previewImage && step === "idle" && (
        <div className="flex flex-col gap-2 h-[300px]">
          <div
            className={cn(
              "h-full flex items-center justify-center rounded-field px-4 text-center cursor-pointer transition-colors",
              isDragging ? "" : ""
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              ref={inputRef}
            />

            <div className="flex w-full flex-col items-center">
              <CloudUpload size={26} stroke="var(--color-primary)" />

              <div className="text-base mt-6">
                Перетащите сюда изображение или{" "}
                <span className="underline">выберите</span>
              </div>

              <div className="mt-4 text-sm text-base-content/60">
                Форматы JPEG, PNG, WEBP не более 5MB
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Шаг кропа */}
      {step !== "idle" && imageSrc && (
        <div className="w-full h-[360px] flex flex-col gap-3">
          {/* Пресеты аспектов */}
          <div className="flex gap-2 flex-wrap">
            <SegmentedControl
              size="xs"
              variant="surface"
              items={ASPECT_PRESETS.map((preset) => ({
                id: preset.id,
                label: preset.label,
              }))}
              value={aspectPresetId}
              onChange={(id) => handleAspectChange(id)}
            />
          </div>

          <div className="relative h-full rounded-field overflow-hidden bg-black/80">
            {/* КРОППЕР */}
            {/* При загрузке полностью отключаем его */}
            <div
              className={cn(
                step === "uploading" && "pointer-events-none opacity-40"
              )}
            >
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={currentAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {step === "uploading" && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <Loader />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Кнопки управления при кропе */}
      {imageSrc && (
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-md">Масштаб</span>

            <CustomRange
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={setZoom}
              disabled={step === "uploading"} // ← важное место
              className={
                step === "uploading" ? "opacity-50 pointer-events-none" : ""
              }
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              size="sm"
              color="ghost"
              bordered
              disabled={step === "uploading"} // ← дизейблим
            >
              Отмена
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              size="sm"
              disabled={step === "uploading"} // ← дизейблим
            >
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
};

/** Валидация файла по типу и размеру */
function validateFile(file: File, maxSizeMb: number, accept: string) {
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`Файл больше ${maxSizeMb} МБ`);
  }

  // Простая проверка по accept
  if (accept && accept !== "*/*") {
    const allowed = accept
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const isAllowed = allowed.some((pattern) => {
      if (pattern === file.type) return true;
      if (pattern.endsWith("/*")) {
        const prefix = pattern.split("/")[0];
        return file.type.startsWith(prefix + "/");
      }
      return false;
    });

    if (!isAllowed) {
      throw new Error("Тип файла не поддерживается");
    }
  }
}

/** Читаем File в dataURL для кроппера */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Ошибка чтения файла"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/** Загружаем картинку как HTMLImageElement */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Режем картинку через canvas и возвращаем Blob */
async function getCroppedBlob(
  imageSrc: string,
  crop: Area,
  mimeType: string = "image/jpeg",
  quality: number = 0.92
): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas не поддерживается");
  }

  canvas.width = crop.width;
  canvas.height = crop.height;

  ctx.drawImage(
    img,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Не удалось создать Blob"));
        } else {
          resolve(blob);
        }
      },
      mimeType,
      quality
    );
  });
}
