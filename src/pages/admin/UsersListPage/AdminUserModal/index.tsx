// src/features/admin-users/AdminUserInfoModal.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectAppTheme } from "@/features/app/appSlice";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { XCircle, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import Button from "@/shared/ui/Button";

import {
  apiGetUser,
  apiBlockUser,
  apiUnblockUser,
  User,
} from "@/api/modules/users";
import { fetchAdminUsersList } from "@/features/admin-users/adminUserSlice";
import { customToast } from "@/lib/customToast";
import {
  resetFilters,
  setSearch,
} from "@/features/admin-payments/adminPaymentSlice";

export default function AdminUserInfoModal() {
  const { userId } = useParams<{ userId: string }>();
  const open = Boolean(userId);

  const theme = useAppSelector(selectAppTheme);
  const currentPage = useAppSelector((s) => s.adminUsers.page);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [mutating, setMutating] = useState(false);
  const [mutateError, setMutateError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoadError(null);
      return;
    }

    setLoading(true);
    setLoadError(null);

    apiGetUser(userId)
      .then((data) => setUser(data))
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const closeModal = () => {
    navigate("/admin/users", { replace: true });
  };

  const formatDate = (d?: string | null) =>
    d ? new Date(d).toLocaleString() : "—";

  const reloadList = () => {
    dispatch(
      fetchAdminUsersList({
        page: currentPage,
        limit: 50,
      })
    );
  };

  const handleBlockUser = async () => {
    if (!user || user.isBlocked) return;

    const reason =
      window.prompt(
        `Введите причину блокировки пользователя ${user.email ?? user.id}`,
        user.blockedReason ?? ""
      ) ?? undefined;

    if (reason === undefined) return;

    try {
      setMutating(true);
      setMutateError(null);

      const updated = await apiBlockUser(user.id, { reason: reason || null });
      setUser(updated);
      reloadList();
    } catch (e) {
      customToast.error(e);
    } finally {
      setMutating(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!user || !user.isBlocked) return;

    try {
      setMutating(true);
      setMutateError(null);

      const updated = await apiUnblockUser(user.id);
      setUser(updated);
      reloadList();
    } catch (e) {
      customToast.error(e);
    } finally {
      setMutating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent
        className={cn(
          "sm:max-w-lg flex flex-col max-h-[80vh] overflow-y-auto",
          theme === "dark" && "bg-base-100/70 backdrop-blur-md"
        )}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-3 shrink-0">
          <DialogTitle className="text-center text-lg">
            Информация о пользователе
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={22} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {loading && (
          <div className="flex-1 py-10 text-center text-base-content/70">
            Загружаем данные пользователя…
          </div>
        )}

        {!loading && loadError && (
          <div className="flex-1 py-8 flex flex-col items-center gap-4">
            <XCircle className="text-error" size={48} />
            <div className="text-base font-medium text-error">
              Не удалось загрузить пользователя
            </div>
            <div className="text-xs text-base-content/60 max-w-sm text-center">
              {loadError}
            </div>
            <Button onClick={closeModal} className="mt-2 px-6">
              Закрыть
            </Button>
          </div>
        )}

        {!loading && !loadError && user && (
          <>
            <div className="mt-2 flex-1 pr-1 space-y-6">
              {/* Основная инфа */}
              <section className="rounded-box bg-base-200/60 p-3 space-y-1">
                <div className="text-sm font-semibold">
                  {user.email || user.phone || user.id}
                </div>
                <div className="text-xs text-base-content/70">
                  ID: {user.id}
                </div>
                {user.phone && (
                  <div className="text-xs text-base-content/70">
                    Телефон: {user.phone}
                  </div>
                )}
                {user.email && (
                  <div className="text-xs text-base-content/70">
                    Email: {user.email}
                  </div>
                )}
              </section>

              {/* Роль и кредиты */}
              <section className="rounded-box bg-base-200/40 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Роль
                  </div>
                  <div className="font-medium">{user.role}</div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Баланс кредитов
                  </div>
                  <div className="font-medium">{user.tokens}</div>
                </div>
              </section>

              {/* Статусы */}
              <section className="rounded-box bg-base-200/40 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Email подтверждён
                  </div>
                  <div className="font-medium">
                    {user.isEmailVerified ? "Да" : "Нет"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Телефон подтверждён
                  </div>
                  <div className="font-medium">
                    {user.isPhoneVerified ? "Да" : "Нет"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Аккаунт активен
                  </div>
                  <div className="font-medium">
                    {user.isActive ? "Да" : "Нет"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-0.5">
                    Заблокирован
                  </div>
                  <div className="font-medium">
                    {user.isBlocked ? "Да" : "Нет"}
                  </div>
                </div>
              </section>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    dispatch(resetFilters());
                    dispatch(setSearch(user.email));
                    navigate("/admin/payments");
                  }}
                >
                  Платежи
                </Button>
              </div>

              {/* Блокировка / разблокировка */}
              <section className="space-y-2">
                {user.isBlocked && (
                  <div className="rounded-box bg-error/10 border border-error/40 p-3 text-sm space-y-2">
                    <div className="text-xs font-semibold text-error">
                      Аккаунт заблокирован
                    </div>
                    <div className="text-xs text-base-content/70">
                      Дата блокировки: {formatDate(user.blockedAt)}
                    </div>
                    {user.blockedReason && (
                      <div className="text-xs text-base-content/80">
                        Причина: {user.blockedReason}
                      </div>
                    )}
                    <div className="pt-2 flex justify-end">
                      <Button
                        color="ghost"
                        bordered
                        onClick={handleUnblockUser}
                        disabled={mutating}
                        size="sm"
                      >
                        {mutating ? "Разблокируем…" : "Разблокировать"}
                      </Button>
                    </div>
                  </div>
                )}

                {!user.isBlocked && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleBlockUser}
                      disabled={mutating}
                      size="sm"
                      className="bg-error hover:bg-error/80"
                    >
                      {mutating ? "Блокируем…" : "Заблокировать"}
                    </Button>
                  </div>
                )}

                {mutateError && (
                  <div className="text-xs text-error mt-1">{mutateError}</div>
                )}
              </section>

              {/* Таймстемпы */}
              <section className="rounded-box bg-base-200/30 p-3 text-xs space-y-1 text-base-content/70">
                <div>
                  <span className="font-medium">Создан: </span>
                  {formatDate(user.createdAt)}
                </div>
                <div>
                  <span className="font-medium">Обновлён: </span>
                  {formatDate(user.updatedAt)}
                </div>
                <div>
                  <span className="font-medium">Последний вход: </span>
                  {formatDate(user.lastLoginAt)}
                </div>
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
