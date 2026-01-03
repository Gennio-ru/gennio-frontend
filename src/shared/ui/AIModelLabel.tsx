import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";
import { cn } from "@/lib/utils";

interface AIModelLabelProps {
  text: string;
}

export const AIModelLabel = ({ text }: AIModelLabelProps) => {
  const theme = useAppSelector(selectAppTheme);

  return (
    <div
      className={cn(
        "absolute top-0 right-0 px-5 py-1 text-xs bg-primary/40 rounded-bl-box rounded-tr-box",
        theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
      )}
    >
      <span>{text}</span>
    </div>
  );
};
