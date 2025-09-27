import { useAppSelector } from "@/app/hooks";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, authReady } = useAppSelector((s) => s.auth);
  const loc = useLocation();

  // Пока не знаем факт авторизации — показываем загрузку
  if (!authReady) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Проверяем доступ…
      </div>
    );
  }

  // Не авторизован
  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  // Авторизован, но не админ
  if (user.role !== "admin") {
    return <div className="p-6">403 — Forbidden</div>;
  }

  return <>{children}</>;
}
