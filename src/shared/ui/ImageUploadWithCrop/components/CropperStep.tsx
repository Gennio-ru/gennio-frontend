import React from "react";
import Cropper, { Area } from "react-easy-crop";

import { cn } from "@/lib/utils";

import Loader from "../../Loader";
import { SegmentedControl } from "../../SegmentedControl";
import type { ImageUploadWithCropSteps } from "..";

export type AspectPresetId = "portrait" | "square" | "landscape";

export type AspectPreset = {
  id: AspectPresetId;
  label: string;
  value: number;
};

type Props = {
  step: ImageUploadWithCropSteps;
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  currentAspect: number;
  aspectPresetId: AspectPresetId;
  aspectPresets: AspectPreset[];
  onAspectChange: (id: AspectPresetId) => void;
  onCropChange: (next: { x: number; y: number }) => void;
  onZoomChange: (next: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
};

export const CropperStep: React.FC<Props> = ({
  step,
  imageSrc,
  crop,
  zoom,
  currentAspect,
  aspectPresetId,
  aspectPresets,
  onAspectChange,
  onCropChange,
  onZoomChange,
  onCropComplete,
}) => {
  return (
    <div className="w-full h-[360px] flex flex-col gap-3 mt-2">
      <div className="flex gap-2 flex-wrap">
        <SegmentedControl
          size="xs"
          variant="surface"
          items={aspectPresets.map((preset) => ({
            id: preset.id,
            label: preset.label,
          }))}
          value={aspectPresetId}
          onChange={(id) => onAspectChange(id)}
        />
      </div>

      <div className="relative h-full rounded-field overflow-hidden bg-black/80">
        <div className={cn(step === "uploading" && "pointer-events-none opacity-40")}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
          />
        </div>

        {step === "uploading" && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
};
