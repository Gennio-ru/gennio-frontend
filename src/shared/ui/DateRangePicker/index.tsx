import { useEffect, useState } from "react";
import { DateRange, Range, RangeKeyDict } from "react-date-range";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, X as ClearIcon } from "lucide-react";

import "./index.css";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/ui/shadcn/popover";

export type FiltersDateRange = {
  startDate: string | null;
  endDate: string | null;
};

type Props = {
  value: FiltersDateRange;
  onChange: (value: FiltersDateRange) => void;
  className?: string;
};

function parseIsoDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toIsoDate(d: Date | null | undefined): string | null {
  if (!d) return null;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatRu(date: string | null): string {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y}`;
}

export function DateRangePicker({ value, onChange, className }: Props) {
  const [range, setRange] = useState<Range>({
    startDate: parseIsoDate(value.startDate),
    endDate: parseIsoDate(value.endDate),
    key: "selection",
  });

  // флаг: "мы сейчас в процессе выбора диапазона (после первого клика)"
  const [isSelecting, setIsSelecting] = useState(false);

  // синк внешнего value → локального range
  useEffect(() => {
    setRange({
      startDate: parseIsoDate(value.startDate),
      endDate: parseIsoDate(value.endDate),
      key: "selection",
    });
    setIsSelecting(false); // сбрасываем состояние выбора, если фильтры прилетели извне
  }, [value.startDate, value.endDate]);

  const handleChange = (ranges: RangeKeyDict) => {
    const r = ranges.selection;
    setRange(r);

    // первый клик — просто отмечаем начало диапазона
    if (!isSelecting) {
      setIsSelecting(true);
      return;
    }

    // второй клик — диапазон завершён, пушим наружу
    setIsSelecting(false);
    onChange({
      startDate: toIsoDate(r.startDate),
      endDate: toIsoDate(r.endDate),
    });
  };

  const isEmpty = !value.startDate && !value.endDate;

  const label = (() => {
    const { startDate, endDate } = value;
    if (!startDate && !endDate) return "Дата от - дата до";
    if (startDate && !endDate) return formatRu(startDate);
    if (!startDate && endDate) return formatRu(endDate);
    return `${formatRu(startDate)} — ${formatRu(endDate)}`;
  })();

  const handleReset = () => {
    setIsSelecting(false);
    onChange({ startDate: null, endDate: null });
  };

  return (
    <div className="relative w-auto">
      <Popover>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              "w-auto h-12 rounded-field px-3 text-left text-base",
              "bg-base-100 text-base-content border border-base-300",
              "flex items-center justify-between gap-2",
              "transition-colors cursor-pointer",
              className
            )}
          >
            <span className={cn("truncate", isEmpty && "text-base-content/50")}>
              {label}
            </span>

            <div className="flex items-center gap-2">
              {!isEmpty && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="cursor-pointer text-neutral-400 hover:text-neutral-500"
                >
                  <ClearIcon size={16} />
                </button>
              )}

              <CalendarIcon className="shrink-0" size={18} />
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(
            "border border-base-300 bg-base-100 rounded-box shadow-lg",
            "w-auto"
          )}
        >
          <DateRange
            locale={ru}
            ranges={[range]}
            onChange={handleChange}
            moveRangeOnFirstSelection={false}
            retainEndDateOnFirstSelection={false}
            rangeColors={["var(--color-primary)"]}
            direction="horizontal"
            showDateDisplay={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
