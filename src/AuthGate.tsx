import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { bootstrapAuth } from "./features/auth/auth.bootstrap";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, user, status } = useAppSelector((s) => s.auth);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  const bootstrapping = token && !user && status === "loading";

  if (bootstrapping) {
    return null;
  }

  return <>{children}</>;
}
