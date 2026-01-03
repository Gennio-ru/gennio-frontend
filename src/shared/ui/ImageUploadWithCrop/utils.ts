import { Area } from "react-easy-crop";

/** Валидация файла по типу и размеру */
export function validateFile(file: File, maxSizeMb: number, accept: string) {
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`Размер файла больше ${maxSizeMb} МБ`);
  }

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
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Ошибка чтения файла"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function fileToOrientedDataURLAndFile(
  file: File,
  outMime: string = "image/jpeg",
  quality: number = 0.92
): Promise<{ dataUrl: string; normalizedFile: File }> {
  // Сбрасываем EXIF-ориентацию, просто перерисовав картинку в canvas.
  // Браузер применяет ориентацию при drawImage, а сохранённый Blob уже без EXIF.
  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas не поддерживается");

  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob вернул null"))),
      outMime,
      quality
    );
  });

  const normalizedFile = new File([blob], file.name, {
    type: blob.type,
  });

  const normalizedDataUrl = canvas.toDataURL(outMime, quality);
  return { dataUrl: normalizedDataUrl, normalizedFile };
}

/** Загружаем картинку как HTMLImageElement */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/** Режем картинку через canvas и возвращаем Blob */
export async function getCroppedBlob(
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
