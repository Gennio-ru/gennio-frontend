import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/shadcn/select";
import { cn } from "@/lib/utils";
import { X as ClearIcon } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

interface Item<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  onReset?: () => void;
  items: Item<T>[];
  placeholder?: string;
  className?: string;
}

export default function CustomSelect<T extends string>({
  value,
  onChange,
  onReset,
  items,
  placeholder,
  className,
}: Props<T>) {
  const theme = useAppSelector(selectAppTheme);
  const showResetButton = onReset && value;

  return (
    <div className="relative flex items-center w-auto">
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger
          className={cn(
            "flex-1 bg-base-100 text-base-content",
            showResetButton && "gap-8",
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent
          className={cn(
            "shadow-lg",
            theme === "light" ? "shadow-neutral-900/20" : "shadow-base-200"
          )}
        >
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showResetButton && (
        <button
          type="button"
          onClick={onReset}
          className="absolute right-[34px] cursor-pointer text-neutral-400 hover:text-neutral-500"
        >
          <ClearIcon size={16} />
        </button>
      )}
    </div>
  );
}
