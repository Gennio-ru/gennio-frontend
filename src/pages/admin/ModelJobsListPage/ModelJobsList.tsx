import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminModelJobsList,
  setPage,
  setSearch,
  setStatus,
  setType,
  setDateRange,
} from "@/features/admin-model-jobs/adminModelJobSlice";

import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Loader from "@/shared/ui/Loader";
import IconButton from "@/shared/ui/IconButton";
import CustomSelect from "@/shared/ui/CustomSelect";
import { DateRangePicker } from "@/shared/ui/DateRangePicker";

import { Edit } from "lucide-react";

import {
  ModelJobStatus,
  ModelJobType,
  ModelJob,
} from "@/api/modules/model-job";
import AdminModelJobModal from "./AdminModelJobModal";
import { Tooltip } from "@/shared/ui/Tooltip";
import { cn } from "@/lib/utils";
import { route } from "@/shared/config/routes";

type ModelJobStatusSelectItem = {
  value: ModelJobStatus;
  label: string;
};

const statusItems: ModelJobStatusSelectItem[] = [
  { value: "failed", label: "failed" },
  { value: "processing", label: "processing" },
  { value: "queued", label: "queued" },
  { value: "succeeded", label: "succeeded" },
];

type ModelJobTypeSelectItem = {
  value: ModelJobType;
  label: string;
};

const typeItems: ModelJobTypeSelectItem[] = [
  { value: "image-edit-by-prompt-id", label: "image-edit-by-prompt-id" },
  { value: "image-edit-by-prompt-text", label: "image-edit-by-prompt-text" },
  {
    value: "image-generate-by-prompt-text",
    label: "image-generate-by-prompt-text",
  },
];

export default function AdminModelJobsList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, page, totalPages, status, filters, error } = useAppSelector(
    (s) => s.adminModelJobs
  );

  const [searchLocal, setSearchLocal] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchLocal, 300);

  //
  // Подхватываем дебаунс поиска → в стейт фильтров
  //
  useEffect(() => {
    dispatch(setSearch(debouncedSearch.trim() || null));
  }, [debouncedSearch, dispatch]);

  //
  // Загрузка списка при изменении страницы/фильтров
  //
  useEffect(() => {
    dispatch(
      fetchAdminModelJobsList({
        page,
        limit: 50,
      })
    );
  }, [
    dispatch,
    page,
    filters.search,
    filters.status,
    filters.type,
    filters.createdFrom,
    filters.createdTo,
  ]);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const isLoading = status === "loading";

  const rows = useMemo(
    () =>
      items.map((job: ModelJob, index) => {
        const created =
          job.createdAt && new Date(job.createdAt).toLocaleString();

        const statusLabel = String(job.status);

        let statusClass =
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-base-200 text-base-content/80 ";

        if (job.status === "succeeded")
          statusClass += "bg-success/20 text-success";
        else if (job.status === "failed")
          statusClass += "bg-error/20 text-error";
        else statusClass += "bg-warning/20 text-warning";

        const userLabel =
          job.user?.email || job.user?.phone || job.userId || "—";

        return (
          <tr key={job.id} className={cn(index % 2 === 0 && "bg-base-200/40")}>
            {/* Запрос / текст */}
            <td className="p-3 align-top max-w-[260px]">
              <Tooltip content={job.id}>
                <div className="mt-1 text-xs text-base-content/60">
                  ID: {job.id.slice(0, 8)}…
                </div>
              </Tooltip>
            </td>

            {/* Пользователь */}
            <td className="p-3 align-top">
              <div className="font-medium">{userLabel}</div>
            </td>

            {/* Модель / тип */}
            <td className="p-3 align-top">
              <div className="text-sm font-medium">{job.model}</div>
              <div className="mt-1 text-xs text-base-content/60">
                {job.type}
              </div>
              <div className="mt-1 text-xs text-base-content/60">
                Тариф: {job.tariffCode}
              </div>
              <div className="mt-1 text-xs text-base-content/80">
                Токенов списано: {job.tokensCharged}
              </div>
            </td>

            {/* Статус */}
            <td className="p-3 align-top max-w-40">
              <div className={statusClass}>{statusLabel}</div>
              {job.error && (
                <div className="mt-1 text-xs text-error/90 line-clamp-2">
                  {job.error}
                </div>
              )}
            </td>

            {/* Время */}
            <td className="p-3 text-xs hidden lg:table-cell align-top">
              {created && <div className="text-base-content/80">{created}</div>}
            </td>

            {/* Действия */}
            <td className="p-3 align-top flex justify-center">
              <IconButton
                onClick={() => navigate(route.adminJob(job.id))}
                icon={<Edit size={18} />}
                title="Открыть карточку задачи"
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

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <CustomSelect
              value={filters.status}
              items={statusItems}
              placeholder="Статус"
              onChange={(value) => dispatch(setStatus(value as ModelJobStatus))}
              onReset={() => dispatch(setStatus(null))}
              className="min-w-[180px]"
            />

            <CustomSelect
              value={filters.type}
              items={typeItems}
              placeholder="Тип задачи"
              onChange={(value) => dispatch(setType(value as ModelJobType))}
              onReset={() => dispatch(setType(null))}
              className="min-w-[220px]"
            />
          </div>
        </div>

        {/* Поиск */}
        <div className="mb-4">
          <Input
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            placeholder="Поиск по тексту или email"
            className="w-full bg-base-100!"
          />
        </div>

        {status === "failed" && (
          <div className="mb-3 text-error">
            {error || "Не удалось загрузить задачи моделей"}
          </div>
        )}

        {/* Таблица */}
        <div className="overflow-x-auto rounded-box bg-base-100">
          <table className="w-full text-sm">
            <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
              <tr>
                <th className="p-3 text-left">Запрос</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Модель / тип</th>
                <th className="p-3 text-left">Статус</th>
                <th className="p-3 text-left hidden lg:table-cell">Время</th>
                <th className="p-3 text-right">Действия</th>
              </tr>
            </thead>

            <tbody>
              {rows}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td className="p-4 text-base-content/50" colSpan={6}>
                    Задачи не найдены
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

      <AdminModelJobModal />
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
