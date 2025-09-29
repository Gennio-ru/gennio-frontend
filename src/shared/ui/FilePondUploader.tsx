import { useEffect, useMemo, useState } from "react";
import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { FilePond, registerPlugin } from "react-filepond";
import { FilePondInitialFile } from "filepond";

// CSS
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Plugins
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type PondFile = (string | Blob | FilePondInitialFile | File)[];

type UploadFn = (file: File) => Promise<string>; // верни id/ключ (он пойдёт в form state)

type ImageUploaderProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  currentUrl?: string; // стартовый превью-URL (например, уже загруженное "до")
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
  // Подготовим стартовый список файлов для превью по URL (без реального файла)
  const initialFiles = useMemo(() => {
    if (!currentUrl) return [];
    // показываем как локальный (FilePond сам подгрузит <img>)
    return [{ source: currentUrl, options: { type: "local" as const } }];
  }, [currentUrl]);

  // Храним текущее отображаемое состояние FilePond (не form-state)
  const [files, setFiles] = useState<unknown[]>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  return (
    <div className={className}>
      {label && <div className="mb-2 text-sm opacity-80">{label}</div>}

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          return (
            <FilePond
              files={files as PondFile}
              disabled={disabled}
              allowMultiple={false}
              maxFiles={1}
              allowReorder={false}
              credits={false}
              labelIdle='Перетащите сюда изображение или <span class="filepond--label-action">Выберите</span>'
              onupdatefiles={(items) => {
                setFiles(items);
                // Если пользователь удалил последний файл вручную — обнуляем поле формы
                if (items.length === 0 && field.value) {
                  field.onChange(null);
                }
              }}
              onaddfile={async (err, item) => {
                if (err) return;
                const file = item.file as File;
                try {
                  const id = await onUpload(file);
                  field.onChange(id); // сохранили id в форму
                } catch (e) {
                  console.error("Upload failed", e);
                  field.onChange(null);
                }
              }}
              acceptedFileTypes={["image/*"]}
              name="file"
              // Чтоб при клике не открывалось, если disabled
              allowBrowse={!disabled}
              // Чтоб сразу грузить после добавления
              instantUpload
            />
          );
        }}
      />
    </div>
  );
}
