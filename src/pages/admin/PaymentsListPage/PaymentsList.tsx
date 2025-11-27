import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminPayments,
  setPage,
  setDateRange,
  setStatus,
  setSearch,
} from "@/features/admin-payments/adminPaymentSlice";

import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Loader from "@/shared/ui/Loader";
import IconButton from "@/shared/ui/IconButton";
import { Edit } from "lucide-react";

import { DateRangePicker } from "@/shared/ui/DateRangePicker";
import CustomSelect from "@/shared/ui/CustomSelect";
import { PaymentStatus } from "@/api/modules/payments";
import AdminPaymentInfoModal from "./AdminPaymentInfoModal";
import { cn } from "@/lib/utils";
import { route } from "@/shared/config/routes";

type PaymentStatusSelectItem = {
  value: PaymentStatus;
  label: string;
};

const paymentStatusesItems: PaymentStatusSelectItem[] = [
  { value: "CANCELED", label: "CANCELED" },
  { value: "ERROR", label: "ERROR" },
  { value: "PENDING", label: "PENDING" },
  { value: "REFUNDED", label: "REFUNDED" },
  { value: "SUCCEEDED", label: "SUCCEEDED" },
  { value: "WAITING_FOR_CAPTURE", label: "WAITING_FOR_CAPTURE" },
];

export default function PaymentsAdminList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, page, totalPages, status, filters } = useAppSelector(
    (s) => s.adminPayments
  );

  const [searchLocal, setSearchLocal] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchLocal, 300);

  useEffect(() => {
    dispatch(
      fetchAdminPayments({
        page,
        limit: 50,
        createdFrom: filters.createdFrom ?? undefined,
        createdTo: filters.createdTo ?? undefined,
        status: filters.status ?? undefined,
        search: filters.search ?? undefined,
      })
    );
  }, [
    dispatch,
    page,
    filters.createdFrom,
    filters.createdTo,
    filters.status,
    filters.search,
  ]);

  useEffect(() => {
    dispatch(setSearch(debouncedSearch.trim() || null));
  }, [debouncedSearch, dispatch]);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const isLoading = status === "loading";

  const rows = useMemo(
    () =>
      items.map((payment, index) => {
        const amount = `${payment.amount} ${payment.currency}`;
        const created = new Date(payment.createdAt).toLocaleString();
        const updated = new Date(payment.updatedAt).toLocaleString();

        const statusLabel = String(payment.status);
        const hasError = Boolean(payment.errorCode || payment.errorMessage);

        let statusClass =
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-base-200 text-base-content/80 ";

        if (payment.status === "SUCCEEDED")
          statusClass += "bg-success/20 text-success";
        else if (payment.status === "CANCELED")
          statusClass += "bg-error/20 text-error";
        else if (payment.status === "REFUNDED")
          statusClass += "bg-warning/20 text-warning";
        else if (hasError) statusClass += "bg-error/20 text-error";

        return (
          <tr
            key={payment.id}
            className={cn(index % 2 === 0 && "bg-base-200/40")}
          >
            <td className="p-3">
              <div className="font-medium">{amount}</div>
              <div className="text-xs text-base-content/60">
                {payment.provider ?? "—"}
              </div>
            </td>

            <td className="p-3">
              <div className={statusClass}>{statusLabel}</div>
              {hasError && (
                <div className="mt-1 text-xs text-error">
                  {payment.errorCode || "Ошибка"}
                </div>
              )}
              {payment.refundedAmount && (
                <div className="mt-1 text-xs text-warning">
                  Возврат: {payment.refundedAmount} {payment.currency}
                </div>
              )}
            </td>

            <td className="p-3">
              <div>{payment.user?.email ?? payment.userId}</div>
            </td>

            <td className="p-3 text-xs hidden lg:table-cell">
              <div className="text-base-content/80">Создан: {created}</div>
              <div className="text-base-content/60">Обновлён: {updated}</div>
              {payment.capturedAt && (
                <div className="text-base-content/60">
                  Списан: {new Date(payment.capturedAt).toLocaleString()}
                </div>
              )}
              {payment.canceledAt && (
                <div className="text-base-content/60">
                  Отменён: {new Date(payment.canceledAt).toLocaleString()}
                </div>
              )}
              {payment.refundedAt && (
                <div className="text-base-content/60">
                  Возврат: {new Date(payment.refundedAt).toLocaleString()}
                </div>
              )}
            </td>

            <td className="p-3">
              <IconButton
                onClick={() => navigate(route.adminPayment(payment.id))}
                icon={<Edit size={20} />}
              />
            </td>
          </tr>
        );
      }),
    [items, navigate]
  );

  return (
    <>
      <div className="py-6">
        {/* Фильтры */}
        <div className="mb-5 flex flex-col sm:flex-row sm:justify-between gap-3 sm:items-center sm:gap-4">
          <DateRangePicker
            value={{
              startDate: filters.createdFrom,
              endDate: filters.createdTo,
            }}
            onChange={(range) =>
              dispatch(
                setDateRange({ from: range.startDate, to: range.endDate })
              )
            }
            className="min-w-[240px]"
          />

          <CustomSelect
            value={filters.status}
            items={paymentStatusesItems}
            placeholder="Статус"
            onChange={(value) => dispatch(setStatus(value))}
            onReset={() => dispatch(setStatus(null))}
            className="min-w-[200px]"
          />
        </div>

        <div className="mb-4">
          <Input
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            placeholder="Поиск по email, paymentId, описанию, статусу"
            className="w-full bg-base-100!"
          />
        </div>

        {status === "failed" && (
          <div className="mb-3 text-error">Не удалось загрузить платежи</div>
        )}

        {/* Таблица */}
        <div className="overflow-x-auto rounded-box bg-base-100">
          <table className="w-full text-sm">
            <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
              <tr>
                <th className="p-3 text-left">Сумма</th>
                <th className="p-3 text-left">Статус</th>
                <th className="p-3 text-left">Пользователь</th>
                <th className="p-3 text-left hidden lg:table-cell">Время</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {rows}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td className="p-4 text-base-content/50" colSpan={5}>
                    Платежи не найдены
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

      <AdminPaymentInfoModal />
    </>
  );
}

function useDebounce<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
