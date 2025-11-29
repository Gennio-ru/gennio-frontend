import Lottie from "lottie-react";
import { useState } from "react";
import { ModelJobFull } from "@/api/modules/model-job";
import ImageWithLoaderFixed from "@/shared/ui/ImageWithLoaderFixed";
import ResultImageWithPreview from "./ResultImageWithPreview";
import { formatFileSize } from "@/lib/helpers";
import Button from "@/shared/ui/Button";
import spinnerAnimation from "@/assets/loader-white.json";
import JpegLogo from "@/assets/jpeg-icon.svg?react";
import { useNavigate } from "react-router-dom";
import { route } from "@/shared/config/routes";
import { cn } from "@/lib/utils";

type Props = {
  job: ModelJobFull;
};

type Orientation = "horizontal" | "vertical" | "square";

type ImageMeta = {
  widthPx?: number | null;
  heightPx?: number | null;
};

function getOrientation(meta?: ImageMeta | null): Orientation {
  const w = meta?.widthPx ?? 0;
  const h = meta?.heightPx ?? 0;

  if (!w || !h) return "horizontal";

  if (w === h) return "square";
  if (w > h) return "horizontal";
  return "vertical"; // 1 / 1.5
}

export function ModelJobImageResult({ job }: Props) {
  const [downloadingOriginal, setDownloadingOriginal] = useState(false);
  const navigate = useNavigate();

  const {
    text,
    inputFileUrl,
    inputFile,
    outputPreviewFileUrl,
    outputPreviewFile,
    outputFile,
  } = job;

  const showPrompt = !!text;

  // Ориентация — по результату (preview), если есть, иначе по input
  const mainMeta: ImageMeta | undefined =
    (outputPreviewFile as ImageMeta | undefined) ??
    (inputFile as ImageMeta | undefined);

  const orientation = getOrientation(mainMeta);

  const hasInput = !!inputFileUrl;
  const hasOutput = !!outputPreviewFileUrl;
  const hasOutputOriginal = !!outputFile;

  //
  // === DOWNLOAD ORIGINAL FILE ===
  //
  const handleDownloadOriginal = async () => {
    if (!job?.outputFileUrl) return;

    try {
      setDownloadingOriginal(true);

      const res = await fetch(job.outputFileUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "gennio_original.jpeg";
      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setDownloadingOriginal(false);
    }
  };

  const sizeLabel = outputFile?.size ? formatFileSize(outputFile.size) : null;
  const dimsLabel =
    outputFile?.widthPx && outputFile?.heightPx
      ? `${outputFile.widthPx} x ${outputFile.heightPx} px`
      : null;
  const metaText = [sizeLabel, dimsLabel].filter(Boolean).join(", ");

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
        <div className="my-4">
          <span>
            {job.type === "image-edit-by-prompt-id" ? "Детали:  " : "Промпт:  "}
            {text}
          </span>
        </div>
      )}

      {/* HORIZONTAL: 1.5 / 1 — две полосы одна под другой */}
      {orientation === "horizontal" && hasOutput && (
        <div className="w-full flex justify-center">
          <ResultImageWithPreview
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            containerClassName="relative rounded-selector w-full max-w-[600px] aspect-[3/2]"
            className="rounded-selector h-full w-full object-cover"
          >
            {hasInput && (
              <ImageWithLoaderFixed
                src={inputFileUrl ?? undefined}
                alt="Исходное изображение"
                containerClassName="absolute hidden lg:block top-0 left-[-174px] max-w-[150px] aspect-[3/2]"
                className="rounded-selector w-full h-full object-cover"
              />
            )}
          </ResultImageWithPreview>
        </div>
      )}

      {/* VERTICAL: 1 / 1.5 — отдельный кейс */}
      {orientation === "vertical" && hasOutput && (
        <div className="w-full flex justify-center">
          <ResultImageWithPreview
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            containerClassName="relative rounded-selector w-full max-w-[350px] aspect-[2/3]"
            className="rounded-selector h-full w-full object-cover"
          >
            {hasInput && (
              <ImageWithLoaderFixed
                src={inputFileUrl ?? undefined}
                alt="Исходное изображение"
                containerClassName="absolute hidden lg:block top-0 left-[-124px] max-w-[100px] aspect-[2/3]"
                className="rounded-selector w-full h-full object-cover"
              />
            )}
          </ResultImageWithPreview>
        </div>
      )}

      {/* SQUARE: 1 / 1 — свой кейс, более симметричный */}
      {orientation === "square" && hasOutput && (
        <div className="w-full flex justify-center">
          <ResultImageWithPreview
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            containerClassName="relative rounded-selector w-full max-w-[500px] aspect-[1/1]"
            className="rounded-selector h-full w-full object-cover"
          >
            {hasInput && (
              <ImageWithLoaderFixed
                src={inputFileUrl ?? undefined}
                alt="Исходное изображение"
                containerClassName="absolute hidden lg:block top-0 left-[-149px] max-w-[125px] aspect-[1/1]"
                className="rounded-selector w-full h-full object-cover"
              />
            )}
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

          <div className="flex justify-center gap-4 mt-8">
            <Button
              color="secondary"
              onClick={() =>
                navigate(route.aiGenerate(job.type, job.promptId || undefined))
              }
            >
              Попробовать еще
            </Button>

            <Button
              onClick={handleDownloadOriginal}
              disabled={downloadingOriginal}
            >
              <div className="flex gap-1 items-center justify-center">
                <JpegLogo fontSize={24} className="mr-1.5" />
                Скачать генерацию
                {downloadingOriginal && (
                  <Lottie
                    animationData={spinnerAnimation}
                    loop
                    className="w-6 h-6 ml-2"
                  />
                )}
              </div>
            </Button>
          </div>

          <div className="my-3 text-sm text-base-content/60 max-w-sm mx-auto">
            <p>Изображение будет доступно в&nbsp;течение&nbsp;24&nbsp;часов.</p>
            <p>По истечении этого времени оно удалится автоматически.</p>
          </div>
        </div>
      )}

      {hasInput && (
        <ImageWithLoaderFixed
          src={inputFileUrl ?? undefined}
          alt="Исходное изображение"
          containerClassName={cn(
            "block lg:hidden mt-4 mx-auto",
            orientation === "horizontal" && "max-w-[150px] aspect-[3/2]",
            orientation === "vertical" && "max-w-[100px] aspect-[2/3]",
            orientation === "square" && "max-w-[125px] aspect-[1/1]"
          )}
        />
      )}
    </>
  );
}
