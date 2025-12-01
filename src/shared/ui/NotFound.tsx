import { useAppSelector } from "@/app/hooks";
import searchEmpty from "@/assets/search-empty.svg";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";

interface Props {
  enableDescription?: boolean;
}

export function NotFound({ enableDescription = true }: Props) {
  const theme = useAppSelector(selectAppTheme);

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 text-base-content/80">
      <img
        src={searchEmpty}
        alt="Ничего не найдено"
        className={cn(
          "w-[150px] h-[150px] mb-8",
          theme === "light" && "brightness-0"
        )}
      />

      <p
        className={cn(
          "text-2xl mb-3",
          theme === "dark" ? "text-base-content/50" : "text-base-content/50"
        )}
      >
        Ничего не нашлось
      </p>

      {enableDescription && (
        <p
          className={cn(
            "text-base max-w-sm",
            theme === "dark" ? "text-base-content/50" : "text-base-content/50"
          )}
        >
          Попробуйте изменить запрос, добавить деталей
        </p>
      )}
    </div>
  );
}

export default NotFound;
