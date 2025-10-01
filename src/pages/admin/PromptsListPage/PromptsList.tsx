import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminPrompts,
  setSearch,
  setPage,
  setCategory,
  resetCategory,
} from "@/features/admin-prompts/adminPromptSlice";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import CategoriesSelect from "@/shared/ui/CategoriesSelect";

export default function PromptsAdminList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    items,
    page,
    totalPages,
    status,
    filters: { categoryId, search },
  } = useAppSelector((s) => s.adminPrompts);

  const changeCategory = (value: string) => {
    dispatch(setCategory(value));
  };

  const clearCategory = () => {
    dispatch(resetCategory());
  };

  // локальный контрол для поиска + дебаунс
  const [searchLocal, setSearchLocal] = useState(search ?? "");
  const debouncedSearch = useDebounce(searchLocal, 300);

  // подгрузка при изменении страницы/фильтров
  useEffect(() => {
    dispatch(fetchAdminPrompts({ page, limit: 50 }));
  }, [dispatch, page, categoryId, debouncedSearch]);

  // синк дебаунс-поиска в стор
  useEffect(() => {
    // чтобы не диспатчить на каждый keypress — только по debounce
    if (debouncedSearch !== (search ?? "")) {
      dispatch(setSearch(debouncedSearch.trim() ? debouncedSearch : null));
      // страница сбросится в редьюсере setSearch -> page=1
    }
  }, [debouncedSearch, search, dispatch]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const isLoading = status === "loading";

  const rows = useMemo(
    () =>
      items.map((prompt) => (
        <tr
          key={prompt.id}
          className="cursor-pointer hover:bg-base-200"
          onClick={() => navigate(`/admin/prompts/${prompt.id}`)}
        >
          <td className="p-3">{prompt.title}</td>
          <td className="p-3 hidden sm:table-cell">{prompt.type}</td>
          <td className="p-3 hidden md:table-cell">
            {prompt.category?.name || "-"}
          </td>
          <td className="p-3 hidden lg:table-cell">
            {new Date(prompt.createdAt).toLocaleString()}
          </td>
        </tr>
      )),
    [items, navigate]
  );

  return (
    <div className="py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            value={searchLocal}
            onChange={(e) => setSearchLocal(e.target.value)}
            placeholder="Search by title or description"
            className="bg-base-100!"
          />
        </div>

        <CategoriesSelect
          value={categoryId || null}
          onChange={changeCategory}
          onReset={clearCategory}
          className="bg-base-100"
        />

        <Button
          className="sm:w-auto"
          onClick={() => navigate("/admin/prompts/new")}
        >
          + New prompt
        </Button>
      </div>

      {status === "failed" && (
        <div className="mb-3 text-error">Failed to load</div>
      )}

      <div className="overflow-hidden rounded-box bg-base-100">
        <table className="w-full text-sm">
          <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left hidden sm:table-cell">Type</th>
              <th className="p-3 text-left hidden md:table-cell">Category</th>
              <th className="p-3 text-left hidden lg:table-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows}

            {items.length === 0 && status !== "loading" && (
              <tr>
                <td className="p-4 text-base-content/50" colSpan={4}>
                  Не найдено
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-base-content/50" />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-base-content/70">
        <div>
          Page {page} of {totalPages}
        </div>
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

function useDebounce<T>(value: T, delay = 300): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
