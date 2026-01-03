import { useMemo, useState } from "react";
import { ModelJobFull } from "@/api/modules/model-job";
import ImageWithLoaderFixed from "@/shared/ui/ImageWithLoaderFixed";
import ResultImageWithPreview from "./ResultImageWithPreview";
import { formatFileSize } from "@/lib/helpers";
import Button from "@/shared/ui/Button";
import JpegLogo from "@/assets/jpeg-icon.svg?react";
import PngLogo from "@/assets/png-icon.svg?react";
import { useNavigate } from "react-router-dom";
import { route } from "@/shared/config/routes";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip } from "@/shared/ui/Tooltip";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { AspectRatio, getAspectRatio, ImageMeta } from "./helpers";
import GlassCard from "@/shared/ui/GlassCard";

type Props = {
  job: ModelJobFull;
};

function firstOf<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export function ModelJobImageResult({ job }: Props) {
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);
  const navigate = useNavigate();

  const { text } = job;
  const showPrompt = !!text;

  const inputFileUrl = firstOf(job.inputFileUrls);
  const inputFile = firstOf(job.inputFiles);

  const outputPreviewFileUrl = firstOf(job.outputPreviewFileUrls);

  const outputPreviewFile = firstOf(job.outputPreviewFiles);
  const outputFileUrl = firstOf(job.outputFileUrls);
  const outputFile = firstOf(job.outputFiles);

  // Ориентация — по результату (preview), если есть, иначе по input
  const mainMeta: ImageMeta | undefined = outputPreviewFile as
    | ImageMeta
    | undefined;
  const inputMeta: ImageMeta | undefined = inputFile as ImageMeta | undefined;

  const aspectRatio = getAspectRatio(mainMeta);
  const inputAspectRatio = getAspectRatio(inputMeta);

  const hasInput = !!inputFileUrl;
  const hasOutput = !!outputPreviewFileUrl;
  const hasOutputOriginal = !!outputFile;

  //
  // === DOWNLOAD ORIGINAL FILE ===
  //
  const handleDownloadOriginal = async () => {
    ymGoal("on_click_download_original");

    if (!outputFileUrl) return;

    try {
      setDownloadingOriginal(true);

      const res = await fetch(outputFileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      let ext = blob.type.split("/")[1] || "jpg";
      if (ext === "jpeg") ext = "jpg";

      const a = document.createElement("a");
      a.href = url;
      a.download = `gennio_original.${ext}`;
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setDownloadingOriginal(false);
    }
  };

  const metaText = useMemo(() => {
    const sizeLabel = outputFile?.size ? formatFileSize(outputFile.size) : null;
    const dimsLabel =
      outputFile?.widthPx && outputFile?.heightPx
        ? `${outputFile.widthPx} x ${outputFile.heightPx} px`
        : null;
    return [sizeLabel, dimsLabel].filter(Boolean).join(", ");
  }, [outputFile?.size, outputFile?.widthPx, outputFile?.heightPx]);

  return (
    <>
      {job.prompt && (
        <div className="mt-2 mb-10 mx-auto max-w-2xl">
          <p className="font-bold text-[36px] sm:text-[44px]">
            {job.prompt.title}
          </p>
        </div>
      )}

      {showPrompt && (
        <Tooltip content={text} className="max-w-[320px]">
          <div className="my-4 max-w-2xl mx-auto line-clamp-2 overflow-hidden text-ellipsis">
            <span>
              {job.type === "image-edit-by-prompt-id"
                ? "Детали:  "
                : "Промпт:  "}
              {text}
            </span>
          </div>
        </Tooltip>
      )}

      {job.type !== "image-edit-by-style-reference" &&
        job.inputFileUrls?.length > 1 && (
          <GlassCard className="p-2 sm:p-3 mb-4 w-fit mx-auto">
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {job.inputFileUrls.map((url) => (
                <ModelJobResultInputPreview url={url} aspectRatio="1:1" />
              ))}
            </div>
          </GlassCard>
        )}

      {aspectRatio === "1:1" && hasOutput && (
        <div className="w-full flex justify-center">
          <ResultImageWithPreview
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            containerClassName="relative rounded-selector w-full max-w-[500px] aspect-[1/1]"
            className="rounded-selector h-full w-full object-cover"
          >
            {hasInput &&
              (job.type === "image-edit-by-style-reference" ? (
                <>
                  <ModelJobResultInputPreview
                    url={job.inputFileUrls[0]}
                    aspectRatio="1:1"
                    containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                    className="rounded-selector w-full h-full object-cover"
                  />
                  <ModelJobResultInputPreview
                    url={job.inputFileUrls[1]}
                    aspectRatio="1:1"
                    containerClassName="absolute hidden lg:block top-0 left-0 translate-y-[calc(100%+24px)] -translate-x-[calc(100%+24px)]"
                    className="rounded-selector w-full h-full object-cover"
                  />
                </>
              ) : (
                job.inputFileUrls.length === 1 && (
                  <ModelJobResultInputPreview
                    url={inputFileUrl!}
                    aspectRatio={inputAspectRatio}
                    containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                    className="rounded-selector w-full h-full object-cover"
                  />
                )
              ))}
          </ResultImageWithPreview>
        </div>
      )}

      {(aspectRatio === "2:3" ||
        aspectRatio === "3:4" ||
        aspectRatio === "9:16") &&
        hasOutput && (
          <div className="w-full flex justify-center">
            <ResultImageWithPreview
              src={outputPreviewFileUrl ?? undefined}
              alt="Результат"
              containerClassName={cn(
                "relative rounded-selector w-full max-w-[350px]",
                aspectRatio === "2:3" && "aspect-[2/3]",
                aspectRatio === "3:4" && "aspect-[3/4]",
                aspectRatio === "9:16" && "aspect-[9/16]"
              )}
              className="rounded-selector h-full w-full object-cover"
            >
              {hasInput &&
                (job.type === "image-edit-by-style-reference" ? (
                  <>
                    <ModelJobResultInputPreview
                      url={job.inputFileUrls[0]}
                      aspectRatio="1:1"
                      containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                    <ModelJobResultInputPreview
                      url={job.inputFileUrls[1]}
                      aspectRatio="1:1"
                      containerClassName="absolute hidden lg:block top-0 left-0 translate-y-[calc(100%+24px)] -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                  </>
                ) : (
                  job.inputFileUrls.length === 1 && (
                    <ModelJobResultInputPreview
                      url={inputFileUrl!}
                      aspectRatio={inputAspectRatio}
                      containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                  )
                ))}
            </ResultImageWithPreview>
          </div>
        )}

      {(aspectRatio === "3:2" ||
        aspectRatio === "4:3" ||
        aspectRatio === "16:9") &&
        hasOutput && (
          <div className="w-full flex justify-center">
            <ResultImageWithPreview
              src={outputPreviewFileUrl ?? undefined}
              alt="Результат"
              containerClassName={cn(
                "relative rounded-selector w-full max-w-[600px]",
                aspectRatio === "3:2" && "aspect-[3/2]",
                aspectRatio === "4:3" && "aspect-[4/3]",
                aspectRatio === "16:9" && "aspect-[16/9]"
              )}
              className="rounded-selector h-full w-full object-cover"
            >
              {hasInput &&
                (job.type === "image-edit-by-style-reference" ? (
                  <>
                    <ModelJobResultInputPreview
                      url={job.inputFileUrls[0]}
                      aspectRatio="1:1"
                      containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                    <ModelJobResultInputPreview
                      url={job.inputFileUrls[1]}
                      aspectRatio="1:1"
                      containerClassName="absolute hidden lg:block top-0 left-0 translate-y-[calc(100%+24px)] -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                  </>
                ) : (
                  job.inputFileUrls.length === 1 && (
                    <ModelJobResultInputPreview
                      url={inputFileUrl!}
                      aspectRatio={inputAspectRatio}
                      containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
                      className="rounded-selector w-full h-full object-cover"
                    />
                  )
                ))}
            </ResultImageWithPreview>
          </div>
        )}

      {hasOutputOriginal && (
        <div className="w-full flex flex-col fustify-center mt-2">
          {metaText && (
            <p className="text-xs text-base-content/60 text-nowrap">
              Оригинальный размер: {metaText}
            </p>
          )}

          <div className="flex flex-col-reverse min-[500px]:flex-row justify-center items-center gap-4 mt-8">
            <Button
              color="secondary"
              onClick={() => {
                ymGoal("on_click_retry");
                navigate(route.aiGenerate(job.type, job.promptId || undefined));
              }}
              className="min-w-[230px] max-w-[300px] min-[500px]:max-w-auto"
            >
              Попробовать еще
            </Button>

            <Button
              onClick={handleDownloadOriginal}
              disabled={downloadingOriginal}
              className="min-w-[224px] max-w-[300px] min-[500px]:max-w-auto"
              loading={downloadingOriginal}
            >
              <div className="flex gap-1 items-center justify-center">
                {outputFile?.contentType === "image/jpeg" && (
                  <JpegLogo fontSize={28} className="mr-1.5" />
                )}
                {outputFile?.contentType === "image/png" && (
                  <PngLogo fontSize={28} className="mr-1.5" />
                )}
                Скачать генерацию
              </div>
            </Button>
          </div>

          <div className="my-4 text-sm text-base-content/60">
            <Info
              size={18}
              className="min-w-[18px] inline mr-1.5 relative top-[-2px]"
            />
            <span>
              Готовая генерация будет доступна в личном кабинете
              в&nbsp;течение&nbsp;24&nbsp;часов
            </span>
          </div>
        </div>
      )}

      {hasInput &&
        (job.type === "image-edit-by-style-reference" ? (
          <div className="flex justify-center gap-4">
            <ModelJobResultInputPreview
              url={job.inputFileUrls[0]}
              aspectRatio="1:1"
              containerClassName="block lg:hidden mt-4"
            />
            <ModelJobResultInputPreview
              url={job.inputFileUrls[1]}
              aspectRatio="1:1"
              containerClassName="block lg:hidden mt-4"
            />
          </div>
        ) : (
          job.inputFileUrls.length === 1 && (
            <ModelJobResultInputPreview
              url={inputFileUrl!}
              aspectRatio={inputAspectRatio}
              containerClassName="absolute hidden lg:block top-0 left-0 -translate-x-[calc(100%+24px)]"
              className="rounded-selector w-full h-full object-cover"
            />
          )
        ))}
    </>
  );
}

const ModelJobResultInputPreview = ({
  url,
  aspectRatio,
  containerClassName,
  className,
}: {
  url: string;
  aspectRatio: AspectRatio;
  containerClassName?: string;
  className?: string;
}) => {
  return (
    <ImageWithLoaderFixed
      src={url ?? undefined}
      alt="Исходное изображение"
      containerClassName={cn(
        containerClassName,
        aspectRatio === "1:1" && "max-w-[125px] aspect-[1/1]",
        aspectRatio === "2:3" && "max-w-[100px] aspect-[2/3]",
        aspectRatio === "3:2" && "max-w-[150px] aspect-[3/2]",
        aspectRatio === "3:4" && "max-w-[100px] aspect-[3/4]",
        aspectRatio === "4:3" && "max-w-[150px] aspect-[4/3]",
        aspectRatio === "9:16" && "max-w-[100px] aspect-[9/16]",
        aspectRatio === "16:9" && "max-w-[150px] aspect-[16/9]"
      )}
      className={className}
    />
  );
};
