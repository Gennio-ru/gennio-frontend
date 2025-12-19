import React from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { FileDto } from "@/api/modules/files";

import IconButton from "../../IconButton";
import Loader from "../../Loader";
import ImageWithLoader from "../../ImageWithLoader";
import { selectAppTheme } from "@/features/app/appSlice";
import { useAppSelector } from "@/app/hooks";

type UserLike = {
  role?: string;
  tokens?: number;
};

type Props = {
  stroke: string;
  maxFileSizeMb?: number;
  isUploading: boolean;
  uploadingSlotIndex: number | null;
  isAuth: boolean;
  user: UserLike;
  slots: [FileDto | null, FileDto | null];
  draggingSlotIndex: number | null;

  onDropAt: (index: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onDragOverAt: (index: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeaveAt: (index: 0 | 1, e: React.DragEvent<HTMLDivElement>) => void;

  onClickAt: (index: 0 | 1) => void;
  onKeyDownAt: (index: 0 | 1, e: React.KeyboardEvent<HTMLDivElement>) => void;
  onRemoveAt: (index: 0 | 1) => void;
};

export const DoubleUploader: React.FC<Props> = ({
  stroke,
  maxFileSizeMb,
  isUploading,
  uploadingSlotIndex,
  isAuth,
  user,
  slots,
  onDropAt,
  onDragOverAt,
  onDragLeaveAt,
  onClickAt,
  onKeyDownAt,
  onRemoveAt,
}) => {
  const theme = useAppSelector(selectAppTheme);
  const hasTokens =
    isAuth && (user?.role === "admin" || (user?.tokens ?? 0) > 0);
  const bothFilled = Boolean(slots[0]?.url) && Boolean(slots[1]?.url);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-6">
        {([0, 1] as const).map((idx) => {
          const slot = slots[idx];
          const isSlotUploading = isUploading && uploadingSlotIndex === idx;

          return (
            <div
              key={idx}
              className={cn(
                "relative h-full flex items-center justify-center aspect-square rounded-field text-center cursor-pointer transition-colors overflow-hidden",
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
              onDragOver={(e) => onDragOverAt(idx, e)}
              onDragLeave={(e) => onDragLeaveAt(idx, e)}
              onDrop={(e) => onDropAt(idx, e)}
              onClick={() => onClickAt(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => onKeyDownAt(idx, e)}
            >
              {slot?.url ? (
                <>
                  <ImageWithLoader
                    src={slot.url}
                    alt=""
                    // size="xs"
                    containerClassName={cn(
                      "w-full h-full mx-0 !rounded-field",
                      "max-w-none"
                    )}
                    className="object-cover"
                  />

                  {!!slot?.id && !String(slot.id).startsWith("temp-") && (
                    <div className="absolute top-1 right-1 z-20">
                      <IconButton
                        type="button"
                        size="sm"
                        color="ghost"
                        className="bg-base-100/80 h-7 w-7"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onRemoveAt(idx);
                        }}
                        icon={<X size={20} />}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className={cn(
                    "px-2 mx-auto flex items-center flex-col gap-1",
                    theme === "dark" ? "text-[#CBD0DC]" : "text-[#7D7F84]"
                  )}
                >
                  <ImagePlus size={32} strokeWidth={1} />

                  <span>{idx === 0 ? "Ваше фото" : "Референс"}</span>
                </div>
              )}

              {isSlotUploading && (
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
                  <Loader />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!bothFilled && (
        <div className="flex flex-col items-center text-center gap-2 mt-2">
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

          {hasTokens && (
            <div className="text-base">
              Загрузите или перетащите изображения в указанные области
            </div>
          )}

          <div className="text-sm text-base-content/60">
            Форматы JPEG, PNG, WEBP не более {maxFileSizeMb} МБ
          </div>
        </div>
      )}
    </div>
  );
};
