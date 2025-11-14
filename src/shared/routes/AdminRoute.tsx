import { useAppSelector } from "@/app/hooks";
import { Suspense } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import Loader from "../ui/Loader";

export default function AdminRoute() {
  const { user, authReady } = useAppSelector((s) => s.auth);
  const loc = useLocation();

  if (!authReady) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        Проверяем доступ…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: loc }} replace />;
  }

  if (user.role !== "admin") {
    return <div className="p-6">403 — Forbidden</div>;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Outlet />
    </Suspense>
  );
}
