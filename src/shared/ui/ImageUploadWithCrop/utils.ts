import { Area } from "react-easy-crop";
import * as exifr from "exifr";

type ImageOrientation = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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

const detectOrientation = async (file: File): Promise<ImageOrientation> => {
  try {
    const o = await exifr.orientation(file);
    if (typeof o === "number" && o >= 1 && o <= 8) return o as ImageOrientation;
  } catch {
    // ignore
  }
  return 1;
};

/** Нормализуем ориентацию без изменения размеров/кропа */
export async function normalizeImageOrientation(file: File): Promise<File> {
  const orientation = await detectOrientation(file);
  if (orientation === 1) return file;

  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const swap = orientation > 4;

  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas не поддерживается");

  switch (orientation) {
    case 2:
      ctx.setTransform(-1, 0, 0, 1, w, 0);
      break;
    case 3:
      ctx.setTransform(-1, 0, 0, -1, w, h);
      break;
    case 4:
      ctx.setTransform(1, 0, 0, -1, 0, h);
      break;
    case 5:
      ctx.setTransform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.setTransform(0, 1, -1, 0, h, 0);
      break;
    case 7:
      ctx.setTransform(0, -1, -1, 0, h, w);
      break;
    case 8:
      ctx.setTransform(0, -1, 1, 0, 0, w);
      break;
    default:
      ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.drawImage(img, 0, 0);

  const targetMime = file.type || "image/jpeg";
  const lossy = /jpe?g|webp/i.test(targetMime);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Не удалось создать Blob"))),
      targetMime,
      lossy ? 0.92 : undefined
    );
  });

  return new File([blob], file.name, { type: blob.type });
}
