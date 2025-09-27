import { useAppSelector } from "@/app/hooks";
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthReady,
  selectAuthStatus,
} from "./authSlice";

export function useAuth() {
  const user = useAppSelector(selectUser);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const ready = useAppSelector(selectAuthReady);
  const status = useAppSelector(selectAuthStatus);

  return { user, isAuth, ready, status };
}
