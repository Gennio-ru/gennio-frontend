import React, { useCallback, useEffect, useRef, useState } from "react";
import { Area } from "react-easy-crop";

import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { selectAppTheme, setPaymentModalOpen } from "@/features/app/appSlice";

import { useAuth } from "@/features/auth/useAuth";

import { FileDto } from "@/api/modules/files";
import { validateFile, fileToDataURL, getCroppedBlob } from "./utils";
import { ImageUploadBanner, LocalBanner } from "./ImageUploadBanner";
import { ImageUploadPreview } from "./ImageUploadPreview";
import { setAuthModalOpen } from "@/features/auth/authSlice";
import { EmptyUploader } from "./components/EmptyUploader";
import { CropperStep, AspectPreset } from "./components/CropperStep";
import { CropControls } from "./components/CropControls";

type ImageUploadWithCropProps = {
  /** single: FileDto | null, multiple: FileDto[] | null */
  value?: FileDto | FileDto[] | null;

  /** single: FileDto | null, multiple: FileDto[] | null */
  onChange?: (value: FileDto | FileDto[] | null) => void;

  /** Колбек, который получит файл (кропнутый или оригинал) и вернёт сохранённый FileDto */
  onUpload: (file: File) => Promise<FileDto> | FileDto;

  accept?: string;
  maxFileSizeMb?: number;
  initialAspectPreset?: "portrait" | "square" | "landscape";
  outputFileName?: string;

  onRemove?: (file: FileDto) => Promise<void> | void;

  fromToImagesUrls?: [string, string];

  /** разрешить несколько файлов */
  multiple?: boolean;

  /** максимум файлов в multiple-режиме */
  maxFiles?: number;

  /** выключить кроп (грузить как есть) */
  enableCrop?: boolean;
};

const ASPECT_PRESETS: AspectPreset[] = [
  { id: "portrait" as const, label: "2 : 3", value: 2 / 3 },
  { id: "square" as const, label: "1 : 1", value: 1 },
  { id: "landscape" as const, label: "3 : 2", value: 1.5 },
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
  multiple = false,
  maxFiles = 10,
  enableCrop = true,
  onRemove,
}) => {
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const { isAuth, user } = useAuth();

  const [step, setStep] = useState<ImageUploadWithCropSteps>("idle");
  const [banner, setBanner] = useState<LocalBanner | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Список загруженных файлов (single = максимум 1)
  const [previewImages, setPreviewImages] = useState<FileDto[]>([]);

  // id временной плитки, на которой надо показывать Loader
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Для кропа
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const [aspectPresetId, setAspectPresetId] = useState<
    "portrait" | "square" | "landscape"
  >(initialAspectPreset);

  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveMaxFiles = Math.max(1, multiple ? maxFiles : 1);
  const canAddMore = previewImages.length < effectiveMaxFiles;

  // value -> state
  useEffect(() => {
    if (!value) {
      setPreviewImages([]);
      return;
    }
    if (Array.isArray(value)) {
      setPreviewImages(value.slice(0, effectiveMaxFiles));
      return;
    }
    setPreviewImages([value]);
  }, [value, effectiveMaxFiles]);

  const emitChange = (nextRealOnly: FileDto[]) => {
    if (multiple) {
      onChange?.(nextRealOnly.length ? nextRealOnly : null);
    } else {
      onChange?.(nextRealOnly[0] ?? null);
    }
  };

  const getRealOnly = (arr: FileDto[]) =>
    arr.filter((x) => !!x?.id && !String(x.id).startsWith("temp-"));

  const currentAspect =
    ASPECT_PRESETS.find((p) => p.id === aspectPresetId)?.value ?? 1;

  // --- Баннеры успех/ошибка ---
  const showError = (message: string) => {
    setBanner({ id: Date.now(), message, type: "error" });
  };

  const showSuccess = (message: string = "Успешная загрузка") => {
    setBanner({ id: Date.now(), message, type: "success" });
  };

  const hideBanner = () => setShowBanner(false);

  useEffect(() => {
    if (!banner) return;
    setShowBanner(true);
    const timer = setTimeout(() => setShowBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [banner, banner?.id]);

  useEffect(() => {
    if (showBanner) return;
    if (!banner) return;
    const timer = setTimeout(() => setBanner(null), 250);
    return () => clearTimeout(timer);
  }, [showBanner, banner]);

  const handleCloseBanner = () => hideBanner();

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

  const ensureCanAcceptNewFile = () => {
    if (!multiple && previewImages.length === 1) return true; // replace is ok
    if (multiple && !canAddMore) {
      showError(`Можно загрузить максимум ${effectiveMaxFiles} файл(ов)`);
      return false;
    }
    return true;
  };

  // --- Temp preview helpers (чтобы не схлопывалось и был Loader на плитке) ---
  const addTempTile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const tempTile = { id: tempId, url: objectUrl } as FileDto;

    setPreviewImages((prev) => {
      const next = multiple ? [...prev, tempTile] : [tempTile];
      return next.slice(0, effectiveMaxFiles);
    });

    setUploadingId(tempId);

    return { tempId, objectUrl };
  };

  const cleanupTempTile = (tempId: string, objectUrl: string) => {
    setPreviewImages((prev) => prev.filter((x) => x.id !== tempId));
    URL.revokeObjectURL(objectUrl);
    setUploadingId(null);
  };

  const replaceTempTile = (
    tempId: string,
    objectUrl: string,
    uploaded: FileDto
  ) => {
    setPreviewImages((prev) => {
      const next = prev.map((x) => (x.id === tempId ? uploaded : x));
      return next.slice(0, effectiveMaxFiles);
    });

    URL.revokeObjectURL(objectUrl);
    setUploadingId(null);

    // наружу — только реальные
    const nextReal = getRealOnly(
      (multiple ? [...previewImages, uploaded] : [uploaded]).map((x) =>
        x.id === tempId ? uploaded : x
      )
    ).slice(0, effectiveMaxFiles);

    emitChange(nextReal);
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

    if (!enableCrop) {
      // ✅ без кропа: сразу показываем превью + лоадер на временной плитке
      hideBanner();
      setStep("uploading");

      const { tempId, objectUrl } = addTempTile(file);

      try {
        const uploaded = await Promise.resolve(onUpload(file));
        if (!uploaded || !uploaded.id)
          throw new Error("Не удалось загрузить файл");

        replaceTempTile(tempId, objectUrl, uploaded);
        showSuccess();
        setStep("idle");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ошибка при загрузке файла";
        showError(message);
        cleanupTempTile(tempId, objectUrl);
        setStep("idle");
      }

      return;
    }

    // ✅ с кропом: открываем кроппер
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

  const clearForSingleReplace = () => {
    if (!multiple && previewImages.length) {
      setPreviewImages([]);
      emitChange([]);
    }
  };

  const handleIncomingFile = async (file: File) => {
    if (step === "uploading") return; // защита от повторных
    if (requireAuth()) return;
    if (requireTokens()) return;
    if (!ensureCanAcceptNewFile()) return;

    if (!multiple) clearForSingleReplace();
    await processFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleIncomingFile(file);
    e.target.value = "";
  };

  // --- Drag & Drop (общие) ---
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

    await handleIncomingFile(file);
  };

  const handleUploadAreaClick = () => {
    if (step === "uploading") return;
    if (requireAuth()) return;
    if (requireTokens()) return;

    if (multiple && !canAddMore) {
      showError(`Можно загрузить максимум ${effectiveMaxFiles} файл(ов)`);
      return;
    }

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
    if (!enableCrop) return;
    if (step === "uploading") return;
    if (!imageSrc || !croppedAreaPixels || !originalFile) return;

    hideBanner();

    // готовим файл
    setStep("uploading");

    let file: File;
    try {
      const blob = await getCroppedBlob(
        imageSrc,
        croppedAreaPixels,
        "image/jpeg",
        0.9
      );
      file = new File([blob], outputFileName, { type: blob.type });
    } catch {
      showError("Ошибка при обработке изображения");
      setStep("cropping");
      return;
    }

    // ✅ сразу уходим с кропа на превью
    setImageSrc(null);
    setOriginalFile(null);

    // ✅ сразу добавляем временную плитку с локальным objectURL
    const { tempId, objectUrl } = addTempTile(file);

    try {
      const uploaded = await Promise.resolve(onUpload(file));
      if (!uploaded || !uploaded.id)
        throw new Error("Не удалось загрузить файл");

      replaceTempTile(tempId, objectUrl, uploaded);
      showSuccess();
      setStep("idle");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ошибка при загрузке файла";
      showError(message);

      // ❗️ если аплоад упал — вернём пользователя обратно в кроп
      cleanupTempTile(tempId, objectUrl);

      // восстановим кроп-экран (пересоздадим imageSrc из исходника)
      try {
        const dataUrl = await fileToDataURL(originalFile ?? file);
        setOriginalFile(originalFile ?? file);
        setImageSrc(dataUrl);
        setStep("cropping");
      } catch {
        setStep("idle");
      }
    }
  };

  const handleAspectChange = (id: "portrait" | "square" | "landscape") => {
    setAspectPresetId(id);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleRemoveAt = async (index: number) => {
    const file = previewImages[index];
    if (!file) return;

    // нельзя удалять временную, пока грузится
    if (uploadingId && file.id === uploadingId) return;

    const prev = previewImages;
    const next = prev.filter((_, i) => i !== index);

    setPreviewImages(next);

    // наружу — только реальные
    emitChange(getRealOnly(next));

    if (!onRemove) return;

    try {
      await Promise.resolve(onRemove(file));
    } catch (err) {
      // rollback
      setPreviewImages(prev);
      emitChange(getRealOnly(prev));
      const message =
        err instanceof Error ? err.message : "Не удалось удалить файл";
      showError(message);
    }
  };

  const stroke = theme === "dark" ? "%23CBD0DC" : "%237d7f84";
  const hasPreview = previewImages.length > 0;

  const showEmptyUploader = !hasPreview && !imageSrc;
  const showUploader =
    showEmptyUploader && (step === "idle" || step === "uploading");

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

      {/* Превью (single/multiple) */}
      {hasPreview && !imageSrc && (
        <ImageUploadPreview
          images={previewImages}
          theme={theme}
          multiple={multiple}
          canAddMore={multiple ? canAddMore : true}
          maxFiles={effectiveMaxFiles}
          maxFileSizeMb={maxFileSizeMb}
          isDragging={isDragging}
          isUploading={step === "uploading"}
          uploadingId={uploadingId}
          stroke={stroke}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClickAdd={handleUploadAreaClick}
          onRemoveAt={handleRemoveAt}
        />
      )}

      {/* Пустой аплоадер (когда превью ещё нет) */}
      {showUploader && (
        <EmptyUploader
          stroke={stroke}
          fromToImagesUrls={fromToImagesUrls}
          multiple={multiple}
          maxFiles={maxFiles}
          maxFileSizeMb={maxFileSizeMb}
          isUploading={step === "uploading"}
          isAuth={isAuth}
          user={user}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleUploadAreaClick}
          onKeyDown={handleUploadAreaKeyDown}
        />
      )}

      {/* Шаг кропа */}
      {enableCrop && step !== "idle" && imageSrc && (
        <CropperStep
          step={step}
          imageSrc={imageSrc}
          crop={crop}
          zoom={zoom}
          currentAspect={currentAspect}
          aspectPresetId={aspectPresetId}
          aspectPresets={ASPECT_PRESETS}
          onAspectChange={handleAspectChange}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      )}

      {/* Кнопки управления при кропе */}
      {enableCrop && imageSrc && (
        <CropControls
          step={step}
          zoom={zoom}
          onZoomChange={setZoom}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};
