import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, CircleCheck, XIcon } from "lucide-react";
import IconButton from "../IconButton";
import { cn } from "@/lib/utils";
import type { ImageUploadWithCropSteps } from ".";

export type BannerType = "error" | "success";

export type LocalBanner = {
  id: number;
  message: string;
  type: BannerType;
};

type Props = {
  banner: LocalBanner | null;
  step: ImageUploadWithCropSteps;
  showBanner: boolean;
  onClose: () => void;
};

export const ImageUploadBanner: React.FC<Props> = ({
  banner,
  step,
  showBanner,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {banner && showBanner && (
        <motion.div
          key={banner.id}
          className={cn(
            "pointer-events-none absolute left-1.5 right-1.5 top-0 flex justify-center z-30",
            step === "cropping" ? "top-[56px]" : "top-0"
          )}
          initial={{ y: "-140%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-140%", opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 22,
            mass: 0.7,
          }}
        >
          <div
            className={cn(
              "pointer-events-auto relative mt-1.5 w-full h-11 flex items-center",
              "justify-center rounded-[6px] px-3 py-2 bg-zinc-900/90",
              banner.type === "error" ? "text-error" : "text-success"
            )}
            role="alert"
          >
            <span className="flex gap-2 items-center text-sm text-nowrap">
              {banner.type === "success" ? (
                <CircleCheck size={18} stroke="var(--color-success)" />
              ) : (
                <CircleAlert size={18} stroke="var(--color-error)" />
              )}
              {banner.message}
            </span>

            <IconButton
              size="sm"
              color="ghost"
              onClick={onClose}
              className="w-6 h-6 absolute right-2 cursor-pointer"
              icon={<XIcon size={16} stroke={"white"} />}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
