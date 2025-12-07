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
    <div className="mx-auto max-w-xl text-left mt-6 space-y-4">
      <div
        className={cn(
          "rounded-selector p-3",
          theme === "dark"
            ? "bg-warning/20 text-warning"
            : "text-base-content/70 bg-warning/40"
        )}
      >
        Запрос отклонён модерацией нейросети.
      </div>

      {prompt ? (
        <GlassCard className="rounded-selector">
          <div className="flex flex-col gap-2 items-start text-sm">
            <p className="shrink-0 w-24">Промпт:</p>
            <p className="break-words whitespace-pre-wrap text-base-content/80">
              {prompt}
            </p>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="rounded-selector">
        <div className="text-sm text-base-content/80 leading-relaxed">
          Это обычно случается, если промпт содержит запрещённый или пограничный
          контент (насилие, откровенная эротика, персональные данные, политика,
          призывы к вреду и т.п.) или нарушает авторские права (бренды,
          знаменитости, защищённые персонажи и др.). Попробуйте
          переформулировать запрос:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>уберите явные и спорные формулировки;</li>
            <li>
              опишите идею нейтрально, без деталей, которые могут триггерить
              модерацию;
            </li>
            <li>
              уменьшите «реалистичность» описания, если это изображения людей
              (например, «иллюстрация персонажа», а не фото конкретного
              человека);
            </li>
            <li>
              избегайте упоминаний реальных людей, брендов, логотипов и
              персонажей, защищённых авторским правом;
            </li>
            <li>
              не описывайте сцены с оружием, кровью, саморазрушением,
              наркотиками или явным насилием.
            </li>
          </ul>
          <div className="mt-2">
            Если ошибка повторяется, попробуйте упростить промпт и убрать всё,
            что может выглядеть как реальный вред или нарушение прав других
            людей.
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
