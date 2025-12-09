import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { CloudUpload, Undo } from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { selectAppTheme, setPaymentModalOpen } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";

import { SegmentedControl } from "../SegmentedControl";
import Button from "../Button";
import { CustomRange } from "../CustomRange";
import Loader from "../Loader";
import ImageWithLoaderFixed from "../ImageWithLoaderFixed";
import { useAuth } from "@/features/auth/useAuth";

import { FileDto } from "@/api/modules/files";
import { validateFile, fileToDataURL, getCroppedBlob } from "./utils";
import { ImageUploadBanner, LocalBanner } from "./ImageUploadBanner";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { setAuthModalOpen } from "@/features/auth/authSlice";

type ImageUploadWithCropProps = {
  /** Уже загруженная картинка (например, из бэка) */
  value?: FileDto | null;
  /** Сообщаем наружу, что превью поменялось (или null, если удалили) */
  onChange?: (file: FileDto | null) => void;
  /** Колбек, который получит уже обрезанный файл и вернёт данные сохранённого изображения */
  onUpload: (file: File) => Promise<FileDto> | FileDto;
  /** Разрешённые mime-типы, по умолчанию только картинки */
  accept?: string;
  /** Макс. размер файла (МБ) */
  maxFileSizeMb?: number;
  /** Начальный пресет (portrait/square/landscape) */
  initialAspectPreset?: "portrait" | "square" | "landscape";
  /** Название файла по умолчанию при сохранении */
  outputFileName?: string;
  /** Опционально: колбек для удаления файла на бэке (DB/S3) */
  onRemove?: (file: FileDto) => Promise<void> | void;
  /** URL изображений от - до */
  fromToImagesUrls?: [string, string];
};

const ASPECT_PRESETS = [
  {
    id: "portrait" as const,
    label: "2 : 3",
    value: 2 / 3, // width:height → ~0.666...
  },
  {
    id: "square" as const,
    label: "1 : 1",
    value: 1,
  },
  {
    id: "landscape" as const,
    label: "3 : 2",
    value: 1.5,
  },
];

export type ImageUploadWithCropSteps = "idle" | "cropping" | "uploading";

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  value,
  onChange,
  onUpload,
  accept = "image/png,image/jpg,image/jpeg,image/webp",
  maxFileSizeMb = 10,
  initialAspectPreset = "square",
  outputFileName = "cropped-image.jpg",
  fromToImagesUrls,
}) => {
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const { isAuth, user } = useAuth();

  const [step, setStep] = useState<ImageUploadWithCropSteps>("idle");
  const [banner, setBanner] = useState<LocalBanner | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [aspectPresetId, setAspectPresetId] = useState<
    "portrait" | "square" | "landscape"
  >(initialAspectPreset);

  const [previewImage, setPreviewImage] = useState<FileDto | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreviewImage(value ?? null);
  }, [value]);

  const currentAspect =
    ASPECT_PRESETS.find((p) => p.id === aspectPresetId)?.value ?? 1;

  // --- Баннеры успех/ошибка ---

  const showError = (message: string) => {
    setBanner({ id: Date.now(), message, type: "error" });
  };

  const showSuccess = (message: string = "Успешная загрузка") => {
    setBanner({ id: Date.now(), message, type: "success" });
  };

  const hideBanner = () => {
    setShowBanner(false);
  };

  useEffect(() => {
    if (!banner) return;

    setShowBanner(true);

    const timer = setTimeout(() => {
      setShowBanner(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [banner, banner?.id]);

  useEffect(() => {
    if (showBanner) return;
    if (!banner) return;

    const timer = setTimeout(() => {
      setBanner(null);
    }, 250); // чуть больше duration-200

    return () => clearTimeout(timer);
  }, [showBanner, banner]);

  const handleCloseBanner = () => {
    hideBanner();
  };

  // --- Проверка авторизации ---

  const requireAuth = () => {
    if (!isAuth) {
      dispatch(setAuthModalOpen(true));
      return true;
    }
    return false;
  };

  // --- Проверка баланса ---

  const requireTokens = () => {
    if (isAuth && user.role !== "admin" && user.tokens === 0) {
      dispatch(setPaymentModalOpen(true));
      return true;
    }
    return false;
  };

  // --- Общая обработка файла ---

  const processFile = async (file: File) => {
    try {
      validateFile(file, maxFileSizeMb ?? 10, accept);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Неверный файл";
      showError(message);
      return;
    }

    try {
      const dataUrl = await fileToDataURL(file);
      setOriginalFile(file);
      setImageSrc(dataUrl);
      setStep("cropping");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch {
      showError("Не удалось прочитать файл");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (requireAuth()) {
      e.target.value = "";
      return;
    }

    if (requireTokens()) {
      e.target.value = "";
      return;
    }

    if (previewImage) {
      setPreviewImage(null);
      onChange?.(null);
    }

    await processFile(file);
    e.target.value = "";
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

    if (requireAuth()) return;
    if (requireTokens()) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (previewImage) {
      setPreviewImage(null);
      onChange?.(null);
    }

    await processFile(file);
  };

  const handleUploadAreaClick = () => {
    if (requireAuth()) return;
    if (requireTokens()) return;
    inputRef.current?.click();
  };

  const handleUploadAreaKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUploadAreaClick();
    }
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
    hideBanner();
  };

  const handleConfirm = async () => {
    if (step === "uploading") return;
    if (!imageSrc || !croppedAreaPixels || !originalFile) return;

    hideBanner();
    setStep("uploading");

    try {
      const blob = await getCroppedBlob(
        imageSrc,
        croppedAreaPixels,
        "image/jpeg",
        0.9
      );
      const file = new File([blob], outputFileName, { type: blob.type });

      const uploaded = await Promise.resolve(onUpload(file));

      if (!uploaded || !uploaded.id) {
        throw new Error("Не удалось загрузить файл");
      }

      setPreviewImage(uploaded);
      onChange?.(uploaded);

      showSuccess();

      setStep("idle");
      setImageSrc(null);
      setOriginalFile(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ошибка при обработке или загрузке файла";

      showError(message);
      setStep("cropping");
    }
  };

  const handleAspectChange = (id: "portrait" | "square" | "landscape") => {
    setAspectPresetId(id);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const stroke = theme === "dark" ? "%23CBD0DC" : "%237d7f84";

  return (
    <div className="relative overflow-hidden">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        ref={inputRef}
      />

      <ImageUploadBanner
        banner={banner}
        step={step}
        showBanner={showBanner}
        onClose={handleCloseBanner}
      />

      {/* Превью загруженного изображения */}
      {previewImage && (
        <ImageUploadPreview
          previewImage={previewImage}
          theme={theme}
          onClickReplace={handleUploadAreaClick}
        />
      )}

      {/* Шаг выбора файла + Drag & Drop — показываем ТОЛЬКО если превью ещё нет */}
      {!previewImage && step === "idle" && (
        <div className="flex flex-col gap-2 h-[340px]">
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
            onClick={handleUploadAreaClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleUploadAreaKeyDown}
          >
            <div
              className={cn(
                "flex w-full flex-col items-center h-full pb-4",
                fromToImagesUrls ? "justify-start pt-10" : "justify-center"
              )}
            >
              {fromToImagesUrls && (
                <div className="flex gap-2 mb-9 relative">
                  <ImageWithLoaderFixed
                    src={fromToImagesUrls[0]}
                    alt="preview"
                    containerClassName="w-[100px] h-[100px]"
                    className="rounded-field"
                  />

                  <ImageWithLoaderFixed
                    src={fromToImagesUrls[1]}
                    alt="preview"
                    containerClassName="w-[100px] h-[100px]"
                    className="rounded-field"
                  />

                  <Undo className="absolute top-[-20px] left-1/2 -translate-x-1/2 -scale-x-100 rotate-14" />
                </div>
              )}

              {isAuth && (user.tokens > 0 || user.role === "admin") && (
                <CloudUpload size={26} stroke="var(--color-primary)" />
              )}

              {isAuth && (user.tokens > 0 || user.role === "admin") && (
                <div className="text-base mt-6">
                  Перетащите сюда изображение или{" "}
                  <span className="underline">выберите</span>
                </div>
              )}

              {!isAuth && (
                <div className={cn("text-[18px] sm:px-30 text-warning")}>
                  Войдите в аккаунт, чтобы загрузить фото и&nbsp;начать
                  редактирование
                </div>
              )}

              {isAuth && user.role !== "admin" && user.tokens === 0 && (
                <div className={cn("text-[18px] sm:px-30 text-warning")}>
                  Пополните баланс токенов
                </div>
              )}

              <div className="mt-4 text-sm text-base-content/60">
                Форматы JPEG, PNG, WEBP не более {maxFileSizeMb} МБ
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Шаг кропа */}
      {step !== "idle" && imageSrc && (
        <div className="w-full h-[360px] flex flex-col gap-3 mt-2">
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
        <div className="flex flex-col min-[440px]:flex-row items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-md">Масштаб</span>

            <CustomRange
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={setZoom}
              disabled={step === "uploading"}
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
              disabled={step === "uploading"}
            >
              Отмена
            </Button>

            <Button
              type="button"
              onClick={handleConfirm}
              size="sm"
              disabled={step === "uploading"}
            >
              Сохранить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
