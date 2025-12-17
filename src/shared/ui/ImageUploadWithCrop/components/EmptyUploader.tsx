import React from "react";
import { CloudUpload, Undo } from "lucide-react";

import { cn } from "@/lib/utils";
import { declOfNum } from "@/lib/helpers";

import Loader from "../../Loader";
import ImageWithLoaderFixed from "../../ImageWithLoaderFixed";

type UserLike = {
  role?: string;
  tokens?: number;
};

type Props = {
  stroke: string;
  fromToImagesUrls?: [string, string];
  multiple: boolean;
  maxFiles: number;
  maxFileSizeMb?: number;
  isUploading: boolean;
  isAuth: boolean;
  user: UserLike;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
};

export const EmptyUploader: React.FC<Props> = ({
  stroke,
  fromToImagesUrls,
  multiple,
  maxFiles,
  maxFileSizeMb,
  isUploading,
  isAuth,
  user,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onKeyDown,
}) => {
  const hasTokens = isAuth && (user?.role === "admin" || (user?.tokens ?? 0) > 0);

  return (
    <div className="flex flex-col gap-2 h-[340px]">
      <div
        className={cn(
          "h-full flex items-center justify-center rounded-field px-4 text-center cursor-pointer transition-colors relative",
          isUploading && "pointer-events-none opacity-70"
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
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
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

          {hasTokens && <CloudUpload size={26} stroke="var(--color-primary)" />}

          {hasTokens && (
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

          {isAuth && user?.role !== "admin" && (user?.tokens ?? 0) === 0 && (
            <div className={cn("text-[18px] sm:px-30 text-warning")}>
              Пополните баланс токенов, чтобы начать редактирование
            </div>
          )}

          {multiple && (
            <div className="mt-4 text-sm text-base-content/60">
              До {maxFiles}{" "}
              {declOfNum(maxFiles, ["изображения", "изображений", "изображений"])}
            </div>
          )}

          <div className="mt-1 text-sm text-base-content/60">
            Форматы JPEG, PNG, WEBP не более {maxFileSizeMb} МБ
          </div>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};

