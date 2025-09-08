import { useAppSelector } from "@/app/hooks";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, status } = useAppSelector((s) => s.auth);
  const loc = useLocation();

  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;

  if (!user && (status === "loading" || status === "idle")) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Проверяем доступ…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  if (user.role !== "admin") {
    return <div className="p-6">403 — Forbidden</div>;
  }

  return <>{children}</>;
}
