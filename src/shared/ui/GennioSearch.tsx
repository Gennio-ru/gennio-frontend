import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { selectAppTheme } from "@/features/app/appSlice";
import { useAppSelector } from "@/app/hooks";

interface GennioSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
}

export function GennioSearch({
  placeholder = "Поиск...",
  value: controlledValue,
  onChange,
  debounceMs = 300,
}: GennioSearchProps) {
  const theme = useAppSelector(selectAppTheme);
  const [inputValue, setInputValue] = useState(controlledValue ?? "");

  // Синхронизируем локальное значение с внешним при изменении value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInputValue(controlledValue);
    }
  }, [controlledValue]);

  // Дебаунс: вызываем onChange с задержкой
  useEffect(() => {
    if (!onChange) return;
    const timeout = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [inputValue, onChange, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue("");
    onChange?.("");
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-[320px] h-10 rounded-field border border-white/10",
        theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
      )}
    >
      {/* Лупа */}
      <Search
        size={18}
        className="absolute left-3 text-base-content/60 pointer-events-none"
      />

      {/* Поле ввода */}
      <input
        type="text"
        value={inputValue || ""}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-8 py-1.5
          bg-transparent text-base-content placeholder:text-base-content/50
          outline-none border-none
        "
        aria-label="Поиск"
      />

      {/* Кнопка очистки */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 text-base-content/50 hover:text-base-content transition-colors cursor-pointer"
          aria-label="Очистить"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
}
