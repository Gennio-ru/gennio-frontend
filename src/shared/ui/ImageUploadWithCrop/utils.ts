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

/** Определяем EXIF-ориентацию (exifr + ручной парсер JPEG), по умолчанию 1 */
async function detectOrientation(file: File): Promise<ImageOrientation> {
  try {
    const exifrOrientation = await exifr.orientation(file);
    if (
      typeof exifrOrientation === "number" &&
      exifrOrientation >= 1 &&
      exifrOrientation <= 8
    ) {
      return exifrOrientation as ImageOrientation;
    }
  } catch {
    // noop — попробуем ручной парсер
  }

  try {
    const buf = await file.slice(0, 256 * 1024).arrayBuffer();
    const view = new DataView(buf);
    if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) return 1;

    let offset = 2;
    while (offset + 4 <= view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        if (offset + 8 > view.byteLength) break;

        const exifStart = offset + 2;
        const exifHeader = view.getUint32(exifStart, false);
        if (exifHeader !== 0x45786966) break; // "Exif"

        const tiffStart = exifStart + 6;
        const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
        const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
        const ifdStart = tiffStart + firstIfdOffset;
        if (ifdStart + 2 > view.byteLength) break;

        const entries = view.getUint16(ifdStart, littleEndian);
        for (let i = 0; i < entries; i++) {
          const entryOffset = ifdStart + 2 + i * 12;
          if (entryOffset + 12 > view.byteLength) break;

          if (view.getUint16(entryOffset, littleEndian) === 0x0112) {
            const orientation = view.getUint16(
              entryOffset + 8,
              littleEndian
            ) as ImageOrientation;
            return orientation;
          }
        }
        break;
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        const size = view.getUint16(offset, false);
        offset += size;
      }
    }
  } catch {
    // ignore
  }

  return 1;
}

export async function fileToOrientedDataURLAndFile(
  file: File,
  outMime: string = "image/jpeg",
  quality: number = 0.92
): Promise<{ dataUrl: string; normalizedFile: File }> {
  const orientation = await detectOrientation(file);

  const dataUrl = await fileToDataURL(file);
  const img = await loadImage(dataUrl);

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;

  const swap = orientation >= 5 && orientation <= 8;

  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas не поддерживается");

  switch (orientation) {
    case 2:
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(w, h);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, h);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(-0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-w, 0);
      break;
    case 7:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-w, 0);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -h);
      break;
    default:
      break;
  }

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
