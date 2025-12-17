import React from "react";

import Button from "../../Button";
import { CustomRange } from "../../CustomRange";
import type { ImageUploadWithCropSteps } from "..";

type Props = {
  step: ImageUploadWithCropSteps;
  zoom: number;
  onZoomChange: (next: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export const CropControls: React.FC<Props> = ({
  step,
  zoom,
  onZoomChange,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="flex flex-col min-[440px]:flex-row items-center justify-between gap-3 mt-3">
      <div className="flex items-center gap-2">
        <span className="text-md">Масштаб</span>

        <CustomRange
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={onZoomChange}
          disabled={step === "uploading"}
          className={step === "uploading" ? "opacity-50 pointer-events-none" : ""}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={onCancel}
          size="sm"
          color="ghost"
          bordered
          disabled={step === "uploading"}
        >
          Отмена
        </Button>

        <Button type="button" onClick={onConfirm} size="sm" disabled={step === "uploading"}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};
