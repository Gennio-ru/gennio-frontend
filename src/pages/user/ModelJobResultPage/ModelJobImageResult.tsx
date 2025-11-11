import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import type { JobWithUrls } from "./index";
import GlassCard from "@/shared/ui/GlassCard";

type Props = {
  job: JobWithUrls;
};

export function ModelJobImageResult({ job }: Props) {
  const { inputFileUrl, outputPreviewFileUrl, text, type } = job;

  const showPrompt =
    !!text &&
    (type === "image-edit-by-prompt-id" ||
      type === "image-edit-by-prompt-text" ||
      type === "image-generate-by-prompt-text");

  return (
    <>
      {showPrompt && (
        <GlassCard className="mb-4 mx-auto inline-block max-w-xl text-left">
          <div className="flex gap-2 items-start">
            <b className="shrink-0 w-20">Промпт:</b>
            <p className="break-words whitespace-pre-wrap max-h-40 overflow-y-auto pr-2 text-base-content/80">
              {text}
            </p>
          </div>
        </GlassCard>
      )}

      {type === "image-edit-by-prompt-id" && (
        <div className="flex flex-col md:flex-row items-start justify-center gap-4">
          <ImageWithLoader src={inputFileUrl} alt="Оригинал" size="xs" />
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}

      {type === "image-edit-by-prompt-text" && (
        <div className="flex flex-col md:flex-row items-start justify-center gap-4">
          <ImageWithLoader src={inputFileUrl} alt="Оригинал" size="xs" />
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}

      {type === "image-generate-by-prompt-text" && (
        <div className="flex items-center justify-center">
          <ImageWithLoader
            src={outputPreviewFileUrl}
            alt="Результат"
            size="xl"
          />
        </div>
      )}
    </>
  );
}
