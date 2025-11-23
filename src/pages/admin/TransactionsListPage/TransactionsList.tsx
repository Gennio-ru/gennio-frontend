import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import {
  fetchTransactionsList,
  setPage,
  setDateRange,
  setReason,
  setDelta,
  setSearch,
} from "@/features/admin-transactions/adminTransactionSlice";

import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Loader from "@/shared/ui/Loader";
import CustomSelect from "@/shared/ui/CustomSelect";
import { DateRangePicker } from "@/shared/ui/DateRangePicker";

import { Transaction, TransactionReason } from "@/api/modules/transactions";
import { Tooltip } from "@/shared/ui/Tooltip";
import { cn } from "@/lib/utils";

//
// ===== Списки селекторов =====
//

const reasonItems: { value: TransactionReason; label: string }[] = [
  { value: "JOB_CHARGE", label: "JOB_CHARGE" },
  { value: "JOB_REFUND", label: "JOB_REFUND" },
  { value: "MANUAL_ADD", label: "MANUAL_ADD" },
  { value: "MANUAL_SUBTRACT", label: "MANUAL_SUBTRACT" },
  { value: "PAYMENT_PURCHASE", label: "PAYMENT_PURCHASE" },
  { value: "PAYMENT_REFUND", label: "PAYMENT_REFUND" },
  { value: "PROMO", label: "PROMO" },
];

// delta: 1 = +, -1 = –
type DeltaFilterValue = "plus" | "minus";

const deltaItems: { value: DeltaFilterValue; label: string }[] = [
  { value: "plus", label: "Начисления (+)" },
  { value: "minus", label: "Списания (-)" },
];

//
// ===== Компонент =====
//
export default function AdminTransactionsList() {
  const dispatch = useAppDispatch();

  const { items, page, totalPages, status, filters, error } = useAppSelector(
    (s) => s.adminTransactions
  );

  const [searchLocal, setSearchLocal] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchLocal, 300);

  //
  // Поиск
  //
  useEffect(() => {
    dispatch(setSearch(debouncedSearch.trim() || null));
  }, [debouncedSearch, dispatch]);

  //
  // Загрузка списка
  //
  useEffect(() => {
    dispatch(fetchTransactionsList({ page, limit: 50 }));
  }, [
    dispatch,
    page,
    filters.search,
    filters.reason,
    filters.delta,
    filters.createdFrom,
    filters.createdTo,
  ]);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const isLoading = status === "loading";

  //
  // Табличные строки
  //
  const rows = useMemo(
    () =>
      items.map((tx: Transaction, index) => {
        const created = new Date(tx.createdAt).toLocaleString();
        const isPositive = tx.delta > 0;

        const deltaColor = isPositive
          ? "text-success"
          : tx.delta < 0
          ? "text-error"
          : "text-base-content/80";

        return (
          <tr key={tx.id} className={cn(index % 2 === 0 && "bg-base-200/40")}>
            {/* Пользователь */}
            <td className="p-3 align-top">
              <div className="font-medium">
                {tx.user?.email || tx.user?.phone || tx.userId}
              </div>

              <Tooltip content={tx.userId}>
                <div className="truncate max-w-40">
                  ID: {tx.userId.slice(0, 8)}…
                </div>
              </Tooltip>
            </td>

            {/* Δ */}
            <td className="p-3 align-top">
              <div className={`font-semibold ${deltaColor}`}>
                {isPositive ? "+" : ""}
                {tx.delta}
              </div>
            </td>

            {/* Причина */}
            <td className="p-3 align-top">
              <span className="inline-flex items-center rounded-full bg-base-200 px-2 py-0.5 text-xs">
                {tx.reason}
              </span>

              {tx.modelJobId && (
                <div
                  className="text-xs mt-1 text-base-content/60 truncate max-w-32"
                  title={tx.modelJobId}
                >
                  job: {tx.modelJobId.slice(0, 8)}…
                </div>
              )}
            </td>

            {/* Meta */}
            <td className="p-3 align-top max-w-[260px]">
              {tx.meta ? (
                <pre className="text-xs bg-base-200 rounded-box px-2 py-1 max-h-24 overflow-y-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(tx.meta, null, 2)}
                </pre>
              ) : (
                <span className="text-base-content/50 text-xs">—</span>
              )}
            </td>

            {/* Дата */}
            <td className="p-3 align-top text-xs">{created}</td>
          </tr>
        );
      }),
    [items]
  );

  //
  // Значение дельта селекта: number → string
  //
  const deltaSelectValue: DeltaFilterValue | null =
    filters.delta === null ? null : filters.delta === 1 ? "plus" : "minus";

  return (
    <div className="py-6">
      {/* Фильтры */}
      <div className="mb-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <DateRangePicker
          value={{
            startDate: filters.createdFrom,
            endDate: filters.createdTo,
          }}
          onChange={(range) =>
            dispatch(setDateRange({ from: range.startDate, to: range.endDate }))
          }
          className="min-w-[240px]"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <CustomSelect
            value={filters.reason}
            items={reasonItems}
            placeholder="Причина"
            onChange={(v) =>
              dispatch(setReason((v as TransactionReason) || null))
            }
            onReset={() => dispatch(setReason(null))}
            className="min-w-[200px]"
          />

          <CustomSelect
            value={deltaSelectValue}
            items={deltaItems}
            placeholder="+ или −"
            onChange={(v) => {
              if (!v) dispatch(setDelta(null));
              else if (v === "plus") dispatch(setDelta(1));
              else if (v === "minus") dispatch(setDelta(-1));
            }}
            onReset={() => dispatch(setDelta(null))}
            className="min-w-[140px]"
          />
        </div>
      </div>

      {/* Поиск */}
      <div className="mb-4">
        <Input
          value={searchLocal}
          onChange={(e) => setSearchLocal(e.target.value)}
          placeholder="Поиск по email"
          className="w-full bg-base-100!"
        />
      </div>

      {status === "failed" && (
        <div className="mb-3 text-error">{error || "Ошибка загрузки"}</div>
      )}

      {/* Таблица */}
      <div className="overflow-x-auto rounded-box bg-base-100">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
            <tr>
              <th className="p-3 text-left">Пользователь</th>
              <th className="p-3 text-left">Δ</th>
              <th className="p-3 text-left">Причина</th>
              <th className="p-3 text-left">Meta</th>
              <th className="p-3 text-left">Дата</th>
            </tr>
          </thead>

          <tbody>
            {rows}

            {!isLoading && items.length === 0 && (
              <tr>
                <td className="p-4 text-base-content/50" colSpan={5}>
                  Транзакции не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isLoading && <Loader />}

      {/* Пагинация */}
      <div className="mt-4 flex items-center justify-between text-sm text-base-content/70">
        <span>
          Страница {page} из {totalPages}
        </span>

        <div className="flex gap-2">
          <Button
            disabled={!canPrev || isLoading}
            onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
          >
            Prev
          </Button>

          <Button
            disabled={!canNext || isLoading}
            onClick={() => dispatch(setPage(page + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

//
// Debounce
//
function useDebounce<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
