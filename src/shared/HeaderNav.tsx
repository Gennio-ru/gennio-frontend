import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import ThemeSwitch from "./ThemeSwitch";
import { useAuth } from "@/features/auth/useAuth";

export default function HeaderNav() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuth, user } = useAuth();

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigate("/login");
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="flex w-full items-center justify-between py-3">
      <Link to="/" className="font-semibold">
        Gennio
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <ThemeSwitch />

        {isAuth && (
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline text-neutral-600">
                {user.email}
              </span>
            )}
            <button
              onClick={onLogout}
              className="rounded-xl bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-950"
            >
              Выйти
            </button>
          </div>
        )}

        {!isAuth && location.pathname !== "/login" && (
          <Link
            to="/login"
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-950"
          >
            Войти
          </Link>
        )}
      </nav>
    </div>
  );
}
