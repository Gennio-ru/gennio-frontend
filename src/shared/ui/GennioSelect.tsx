import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

type Option = { label: string; value: string };

interface GennioSelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function GennioSelect({
  options,
  value,
  onChange,
  placeholder = "",
}: GennioSelectProps) {
  const theme = useAppSelector(selectAppTheme);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filteredOptions = selected
    ? options.filter((opt) => opt.value !== selected.value)
    : options;

  // Закрытие при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Управление клавиатурой
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }

      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        const opt = filteredOptions[highlightedIndex];
        onChange?.(opt.value);
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, highlightedIndex, filteredOptions, onChange]);

  // Сброс выделения при закрытии
  useEffect(() => {
    if (!open) setHighlightedIndex(-1);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative inline-block text-base-content select-none"
    >
      {/* Кнопка */}
      <button
        type="button"
        className="text-3xl md:text-[44px] font-bold flex items-center gap-3 cursor-pointer 
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <motion.div
          animate={{
            rotate: open ? 180 : 0,
            y: open ? 4 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={36} className="relative top-[2px]" />
        </motion.div>
      </button>

      {/* Выпадающее меню */}
      <AnimatePresence>
        {open && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={cn(
              "absolute left-1 mt-2 z-10 min-w-[300px] sm:min-w-[360px] w-full max-h-[290px] overflow-y-auto \
              text-2xl rounded-field py-2",
              theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
            )}
          >
            {filteredOptions.map((opt, i) => (
              <div
                key={opt.value}
                className={cn(
                  "cursor-pointer px-6 py-1.5 my-1.5 transition-colors duration-100",
                  highlightedIndex === i
                    ? "bg-primary/70 text-primary-content"
                    : "hover:bg-primary"
                )}
                onClick={() => {
                  onChange?.(opt.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
