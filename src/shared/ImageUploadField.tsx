import { useState, useRef, useEffect } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

type UploadFn = (file: File) => Promise<string>; // возвращает id/ключ для формы

type ImageUploadFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  currentUrl?: string; // URL из промпта (например, beforeImageUrl)
  onUpload: UploadFn;
  disabled?: boolean;
  accept?: string; // по умолчанию "image/*"
};

export function ImageUploadField<T extends FieldValues>({
  control,
  name,
  label,
  currentUrl,
  onUpload,
  disabled,
  accept = "image/*",
}: ImageUploadFieldProps<T>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ control, name });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // показываем blob если он есть, иначе — текущий URL (если пришёл)
  const shownUrl = blobUrl ?? currentUrl ?? null;

  // чистим старые blob-URL, чтобы не течь памятью
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  async function handleFile(file?: File) {
    if (!file) return;
    setLocalError(null);

    // сразу показать превью
    const nextBlob = URL.createObjectURL(file);
    // освободим прошлый blob, если был
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(nextBlob);

    setIsUploading(true);
    try {
      const id = await onUpload(file); // сервер вернул id/ключ
      onChange(id); // кладём в форму
      // ВАЖНО: blob-превью оставляем — пока родитель не перезагрузит сущность,
      // URL с сервера может быть недоступен. Так избегаем «битого» изображения.
    } catch (e: any) {
      setLocalError(e?.message || "Не удалось загрузить файл");
      // при ошибке оставим blob, чтобы пользователь видел выбранный файл
    } finally {
      setIsUploading(false);
    }
  }

  function clearImage() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setBlobUrl(null);
    onChange(""); // очищаем значение поля — пусть схлопнется по валидации
  }

  return (
    <div className="space-y-1">
      {label && <div className="text-sm text-neutral-600">{label}</div>}

      <div
        className={[
          "relative rounded-lg border p-3 bg-white",
          error || localError ? "border-red-300" : "border-neutral-300",
        ].join(" ")}
      >
        {shownUrl ? (
          <div className="relative">
            <img
              src={shownUrl}
              alt="Превью"
              className="w-full h-40 object-cover rounded-md"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 text-sm rounded-md border hover:bg-neutral-50"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || isUploading}
              >
                Заменить
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm rounded-md border hover:bg-neutral-50"
                onClick={clearImage}
                disabled={disabled || isUploading}
              >
                Удалить
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="w-full h-40 rounded-md grid place-items-center text-sm text-neutral-600 hover:bg-neutral-50"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            Нажмите, чтобы выбрать файл
          </button>
        )}

        <input
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as any).current = el;
          }}
          type="file"
          accept={accept}
          className="hidden"
          onBlur={onBlur}
          onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          disabled={disabled || isUploading}
        />

        {isUploading && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 rounded-lg">
            <div className="size-6 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin" />
          </div>
        )}
      </div>

      {(error?.message || localError) && (
        <p className="text-xs text-red-600">{error?.message || localError}</p>
      )}
    </div>
  );
}
