import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";
import GlassCard from "@/shared/ui/GlassCard";

export default function ModerationBlockedNotice({
  prompt,
}: {
  prompt?: string;
}) {
  const theme = useAppSelector(selectAppTheme);

  return (
    <div className="mx-auto max-w-xl text-left space-y-4">
      <div
        className={cn(
          "rounded-lg p-3",
          theme === "dark"
            ? "bg-warning/20 text-warning"
            : "text-base-content/70 bg-warning/60"
        )}
      >
        Запрос отклонён модерацией нейросети.
      </div>

      {prompt ? (
        <GlassCard>
          <div className="flex gap-2 items-start">
            <b className="shrink-0 w-24">Промпт:</b>
            <p className="break-words whitespace-pre-wrap text-base-content/80">
              {prompt}
            </p>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard>
        <div className="text-sm text-base-content/80 leading-relaxed">
          Это обычно случается, если промпт содержит запрещённый или пограничный
          контент (насилие, откровенная эротика, персональные данные, политика и
          т.п.). Попробуйте переформулировать запрос:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>уберите явные и спорные формулировки;</li>
            <li>
              опишите нейтрально, без деталей, которые могут триггерить
              модерацию;
            </li>
            <li>
              уменьшите «реалистичность» описания, если это изображения людей.
            </li>
          </ul>
        </div>
      </GlassCard>
    </div>
  );
}
