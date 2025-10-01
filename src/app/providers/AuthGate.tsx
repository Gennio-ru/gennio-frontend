import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { initAuthThunk, selectAuthReady } from "@/features/auth/authSlice";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const authReady = useAppSelector(selectAuthReady);

  useEffect(() => {
    dispatch(initAuthThunk()); // один раз проверит сессию (me -> refresh при необходимости)
  }, [dispatch]);

  if (!authReady) return null; // или скелетон/сплэш

  return <>{children}</>;
}
