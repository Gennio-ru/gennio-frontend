import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  fetchAdminUsersList,
  setPage,
  setSearch,
  setRole,
  setTokensMin,
  setTokensMax,
} from "@/features/admin-users/adminUserSlice";

import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import Loader from "@/shared/ui/Loader";
import IconButton from "@/shared/ui/IconButton";
import CustomSelect from "@/shared/ui/CustomSelect";

import { Edit } from "lucide-react";

import { UserRole } from "@/api/modules/users";
import AdminUserInfoModal from "./AdminUserModal";
import { Tooltip } from "@/shared/ui/Tooltip";
import { cn } from "@/lib/utils";

type RoleSelectItem = {
  value: UserRole;
  label: string;
};

const roleItems: RoleSelectItem[] = [
  { value: "user", label: "user" },
  { value: "admin", label: "admin" },
];

export default function AdminUsersList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, page, totalPages, status, filters, error } = useAppSelector(
    (s) => s.adminUsers
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
      fetchAdminUsersList({
        page,
        limit: 50,
      })
    );
  }, [
    dispatch,
    page,
    filters.search,
    filters.role,
    filters.tokensMin,
    filters.tokensMax,
  ]);

  const canPrev = page > 1;
  const canNext = page < totalPages;
  const isLoading = status === "loading";

  const rows = useMemo(
    () =>
      items.map((user, index) => {
        const created =
          user.createdAt && new Date(user.createdAt).toLocaleString();
        const lastLogin =
          user.lastLoginAt && new Date(user.lastLoginAt).toLocaleString();

        const isBlocked = user.isBlocked;
        const statusLabel = isBlocked ? "Заблокирован" : "Активен";

        let statusClass =
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-base-200 text-base-content/80 ";
        if (isBlocked) statusClass += "bg-error/20 text-error";
        else statusClass += "bg-success/20 text-success";

        return (
          <tr key={user.id} className={cn(index % 2 === 0 && "bg-base-200/40")}>
            {/* Пользователь */}
            <td className="p-3 align-middle">
              <div className="font-medium">
                {user.email || user.phone || user.id}
              </div>

              <Tooltip content={user.id}>
                <div className="text-xs text-base-content/60">
                  ID: {user.id.slice(0, 8)}… • Роль: {user.role}
                </div>
              </Tooltip>
            </td>

            {/* Статус */}
            <td className="p-3 align-middle">
              <div className={statusClass}>{statusLabel}</div>
              {user.blockedReason && (
                <div className="mt-1 text-xs text-error/90">
                  {user.blockedReason}
                </div>
              )}
            </td>

            {/* Токены */}
            <td className="p-3 align-middle">
              <div className="text-sm font-medium">{user.tokens} токенов</div>
            </td>

            {/* Даты */}
            <td className="p-3 text-xs hidden lg:table-cell align-middle">
              {created && (
                <div className="text-base-content/80">Создан: {created}</div>
              )}
              {lastLogin && (
                <div className="text-base-content/60">
                  Последний вход: {lastLogin}
                </div>
              )}
            </td>

            {/* Действия */}
            <td className="p-3 align-top">
              <div className="flex justify-end gap-2">
                <IconButton
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  icon={<Edit size={18} />}
                  title="Открыть карточку пользователя"
                />
              </div>
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
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center w-full">
            <CustomSelect
              value={filters.role}
              items={roleItems}
              placeholder="Роль"
              onChange={(value) =>
                dispatch(setRole((value as UserRole) || null))
              }
              onReset={() => dispatch(setRole(null))}
              className="min-w-[180px]"
            />

            <div className="flex gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Минимум токенов"
                value={filters.tokensMin ?? ""}
                onChange={(e) =>
                  dispatch(
                    setTokensMin(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  )
                }
                className="w-full min-w-30 bg-base-100"
              />

              <Input
                type="number"
                min={0}
                placeholder="Максимум токенов"
                value={filters.tokensMax ?? ""}
                onChange={(e) =>
                  dispatch(
                    setTokensMax(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  )
                }
                className="w-full min-w-30 bg-base-100"
              />
            </div>
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
          <div className="mb-3 text-error">
            {error || "Не удалось загрузить пользователей"}
          </div>
        )}

        {/* Таблица */}
        <div className="overflow-x-auto rounded-box bg-base-100">
          <table className="w-full text-sm">
            <thead className="bg-base-100 text-base-content/70 border-b border-base-300">
              <tr>
                <th className="p-3 text-left">Пользователь</th>
                <th className="p-3 text-left">Статус</th>
                <th className="p-3 text-left">Токены</th>
                <th className="p-3 text-left hidden lg:table-cell">Даты</th>
                <th className="p-3 text-right">Действия</th>
              </tr>
            </thead>

            <tbody>
              {rows}

              {!isLoading && items.length === 0 && (
                <tr>
                  <td className="p-4 text-base-content/50" colSpan={5}>
                    Пользователи не найдены
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

      <AdminUserInfoModal />
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
