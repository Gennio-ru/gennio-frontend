import { useEffect, useState } from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { FilePond, registerPlugin } from "react-filepond";
import { X as ClearIcon } from "lucide-react";

// CSS
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "./index.css";

// Plugins
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type UploadFn = (file: File) => Promise<string>;

type ImageUploaderProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  currentUrl?: string;
  onUpload: UploadFn;
  disabled?: boolean;
  className?: string;
};

export default function ImageUploader<T extends FieldValues>({
  control,
  name,
  label,
  currentUrl,
  onUpload,
  disabled,
  className,
}: ImageUploaderProps<T>) {
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(currentUrl);
  const [showUploader, setShowUploader] = useState(true);
  const [imageUploaded] = useState(false);

  useEffect(() => {
    if (currentUrl && !imageUploaded) {
      setShowUploader(false);
    }
  }, [currentUrl, imageUploaded]);

  useEffect(() => {
    if (currentUrl !== lastImageUrl) {
      setLastImageUrl(currentUrl);
      setShowUploader(false);
    }
  }, [currentUrl, lastImageUrl]);

  return (
    <div className={className}>
      {label && <div className="mb-2 text-sm opacity-80">{label}</div>}

      <Controller
        control={control}
        name={name}
        render={({ field }) =>
          !showUploader ? (
            <div className="relative w-full">
              <div className="w-full overflow-hidden rounded-lg bg-base-200">
                <img
                  src={currentUrl}
                  alt="preview"
                  className="w-full h-auto object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUploader(true);
                  field.onChange(null);
                }}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 cursor-pointer"
              >
                <ClearIcon size={18} />
              </button>
            </div>
          ) : (
            <FilePond
              disabled={disabled}
              allowMultiple={false}
              maxFiles={1}
              credits={false}
              acceptedFileTypes={["image/*"]}
              labelIdle='Перетащите сюда изображение или <span class="filepond--label-action">Выберите</span>'
              labelTapToRetry="Нажмите для повтора"
              labelFileProcessingError="Ошибка загрузки"
              labelTapToCancel="Нажмите для отмены"
              labelFileProcessing="Загрузка"
              labelTapToUndo="Нажмите для удаления"
              labelFileProcessingComplete="Загрузка завершена"
              allowBrowse={!disabled}
              instantUpload
              server={{
                process: (
                  fieldName,
                  file,
                  metadata,
                  load,
                  error,
                  progress,
                  abort
                ) => {
                  // создаём контроллер отмены
                  const controller = new AbortController();
                  const signal = controller.signal;

                  (async () => {
                    try {
                      // имитируем прогресс — FilePond ожидает вызовы progress(...)
                      progress(true, 0, 0);

                      // теперь реальный аплоад с возможностью отмены
                      const id = await onUpload(file as File);

                      // завершено успешно
                      load(id);
                    } catch (e) {
                      if (signal.aborted) {
                        console.log("Upload aborted by user");
                        return;
                      }
                      console.error("Upload failed:", e);
                      error("Ошибка загрузки");
                    }
                  })();

                  // FilePond вызывает abort() при нажатии крестика
                  return {
                    abort: () => {
                      controller.abort();
                      abort(); // уведомляем FilePond
                    },
                  };
                },
                revert: (uniqueFileId, load) => {
                  field.onChange(null);
                  load();
                },
              }}
            />
          )
        }
      />
    </div>
  );
}
