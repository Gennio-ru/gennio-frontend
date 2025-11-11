import GlassCard from "@/shared/ui/GlassCard";
import type { JobWithUrls } from "./index";

type Props = {
  job: JobWithUrls;
};

export function ModelJobTextResult({ job }: Props) {
  const { text, outputText } = job;

  return (
    <div className="mx-auto max-w-xl text-left space-y-4">
      {text && (
        <GlassCard>
          <div className="flex gap-2 items-start">
            <b className="shrink-0 w-24">Промпт:</b>
            <p className="break-words whitespace-pre-wrap text-base-content/80">
              {text}
            </p>
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-2 text-sm font-semibold text-base-content/70">
          Сгенерированный текст:
        </div>
        <p className="whitespace-pre-wrap text-base-content">{outputText}</p>
      </GlassCard>
    </div>
  );
}
