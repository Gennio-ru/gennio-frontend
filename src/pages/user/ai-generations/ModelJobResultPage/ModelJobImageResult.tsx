import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import GlassCard from "@/shared/ui/GlassCard";
import { ModelJobFull } from "@/api/modules/model-job";

type Props = {
  job: ModelJobFull;
};

export function ModelJobImageResult({ job }: Props) {
  const {
    inputFileUrl,
    outputPreviewFileUrl,
    text,
    type,
    inputFile,
    outputPreviewFile,
  } = job;

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
          <ImageWithLoader
            src={inputFileUrl ?? undefined}
            alt="Оригинал"
            size="xs"
            widthPx={inputFile.widthPx ?? undefined}
            heightPx={inputFile.heightPx ?? undefined}
          />

          <ImageWithLoader
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            size="xl"
            widthPx={outputPreviewFile.widthPx ?? undefined}
            heightPx={outputPreviewFile.heightPx ?? undefined}
          />
        </div>
      )}

      {type === "image-edit-by-prompt-text" && (
        <div className="flex flex-col md:flex-row items-start justify-center gap-4">
          <ImageWithLoader
            src={inputFileUrl ?? undefined}
            alt="Оригинал"
            size="xs"
            widthPx={inputFile.widthPx ?? undefined}
            heightPx={inputFile.heightPx ?? undefined}
          />

          <ImageWithLoader
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            size="xl"
            widthPx={outputPreviewFile.widthPx ?? undefined}
            heightPx={outputPreviewFile.heightPx ?? undefined}
          />
        </div>
      )}

      {type === "image-generate-by-prompt-text" && (
        <div className="flex items-center justify-center">
          <ImageWithLoader
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            size="xl"
            widthPx={outputPreviewFile.widthPx ?? undefined}
            heightPx={outputPreviewFile.heightPx ?? undefined}
          />
        </div>
      )}
    </>
  );
}
