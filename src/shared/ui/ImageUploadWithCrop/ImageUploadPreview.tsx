import { CloudUpload } from "lucide-react";
import Button from "../Button";
import { cn } from "@/lib/utils";
import { FileDto } from "@/api/modules/files";

type Props = {
  previewImage: FileDto;
  theme: string;
  onClickReplace: () => void;
};

export const ImageUploadPreview: React.FC<Props> = ({
  previewImage,
  theme,
  onClickReplace,
}) => {
  return (
    <div className="flex flex-col gap-2 h-[340px]">
      <div
        className={cn(
          "h-full flex-1 relative group flex items-center justify-center overflow-hidden rounded-field",
          theme === "dark" ? "bg-[#111]" : "bg-[#222]"
        )}
      >
        <img
          src={previewImage.url}
          alt=""
          className="max-w-full max-h-full object-contain transition-opacity duration-200 group-hover:opacity-40"
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <Button
            type="button"
            color="ghost"
            bordered
            onClick={onClickReplace}
            className="font-thin text-white border-white"
          >
            <div className="flex gap-2 items-center">
              <CloudUpload size={20} stroke="var(--color-white)" />
              Загрузить новое фото
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
