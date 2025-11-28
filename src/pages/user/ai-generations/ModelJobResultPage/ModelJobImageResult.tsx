import ImageWithLoader from "@/shared/ui/ImageWithLoader";
import GlassCard from "@/shared/ui/GlassCard";
import { ModelJobFull } from "@/api/modules/model-job";

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
  const {
    text,
    inputFileUrl,
    inputFile,
    outputPreviewFileUrl,
    outputPreviewFile,
  } = job;

  const showPrompt = !!text;

  // Ориентация — по результату (preview), если есть, иначе по input
  const mainMeta: ImageMeta | undefined =
    (outputPreviewFile as ImageMeta | undefined) ??
    (inputFile as ImageMeta | undefined);

  const orientation = getOrientation(mainMeta);

  const hasInput = !!inputFileUrl;
  const hasOutput = !!outputPreviewFileUrl;

  return (
    <>
      {showPrompt && (
        <GlassCard className="mb-4 mx-auto py-4 max-w-xl text-left">
          <p className="font-bold">Промпт</p>
          <p className="mt-1.5 break-words whitespace-pre-wrap max-h-40 overflow-y-auto text-base-content/80">
            {text}
          </p>
        </GlassCard>
      )}

      {/* HORIZONTAL: 1.5 / 1 — две полосы одна под другой */}
      {orientation === "horizontal" && hasOutput && (
        <div className="flex flex-col gap-4 items-center">
          {hasInput && (
            <ImageWithLoader
              src={inputFileUrl ?? undefined}
              alt="Исходное изображение"
              size="xs"
              widthPx={inputFile?.widthPx ?? undefined}
              heightPx={inputFile?.heightPx ?? undefined}
              className="rounded-xl shadow-sm bg-base-200 max-w-3xl w-full"
            />
          )}

          <ImageWithLoader
            src={outputPreviewFileUrl ?? undefined}
            alt="Результат"
            size="xl"
            widthPx={outputPreviewFile?.widthPx ?? undefined}
            heightPx={outputPreviewFile?.heightPx ?? undefined}
            className="rounded-xl shadow-sm bg-base-200 max-w-3xl w-full"
          />
        </div>
      )}

      {/* VERTICAL: 1 / 1.5 — отдельный кейс */}
      {orientation === "vertical" && hasOutput && (
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4">
          {/* Превью (input) — поменьше, слева, если есть */}
          {hasInput && (
            <div className="inline-flex">
              <ImageWithLoader
                src={inputFileUrl ?? undefined}
                alt="Исходное изображение"
                size="xs"
                widthPx={inputFile?.widthPx ?? undefined}
                heightPx={inputFile?.heightPx ?? undefined}
                className="rounded-xl shadow-sm bg-base-200"
              />
            </div>
          )}

          {/* Результат — справа */}
          <div className="inline-flex">
            <ImageWithLoader
              src={outputPreviewFileUrl ?? undefined}
              alt="Результат"
              size="xl"
              widthPx={outputPreviewFile?.widthPx ?? undefined}
              heightPx={outputPreviewFile?.heightPx ?? undefined}
              className="rounded-xl shadow-sm bg-base-200"
            />
          </div>
        </div>
      )}

      {/* SQUARE: 1 / 1 — свой кейс, более симметричный */}
      {orientation === "square" && hasOutput && (
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-3">
          {/* Превью (input) — слева, если есть */}
          {hasInput && (
            <div className="inline-flex">
              <ImageWithLoader
                src={inputFileUrl ?? undefined}
                alt="Исходное изображение"
                size="xs"
                widthPx={inputFile?.widthPx ?? undefined}
                heightPx={inputFile?.heightPx ?? undefined}
                className="rounded-xl shadow-sm bg-base-200"
              />
            </div>
          )}

          {/* Результат — справа */}
          <div className="inline-flex">
            <ImageWithLoader
              src={outputPreviewFileUrl ?? undefined}
              alt="Результат"
              size="xl"
              widthPx={outputPreviewFile?.widthPx ?? undefined}
              heightPx={outputPreviewFile?.heightPx ?? undefined}
              className="rounded-xl shadow-sm bg-base-200"
            />
          </div>
        </div>
      )}

      {/* На всякий случай: если вдруг нет output (неизвестный стейт) */}
      {!hasOutput && hasInput && (
        <div className="flex items-center justify-center">
          <ImageWithLoader
            src={inputFileUrl ?? undefined}
            alt="Изображение"
            size="xl"
            widthPx={inputFile?.widthPx ?? undefined}
            heightPx={inputFile?.heightPx ?? undefined}
            className="rounded-xl shadow-sm bg-base-200 max-w-3xl w-full"
          />
        </div>
      )}
    </>
  );
}
