import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import ThemeSwitch from "../ui/ThemeSwitch";
import { useAuth } from "@/features/auth/useAuth";
import { SidebarToggleButton } from "../layouts/Sidebar";

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
    <div className="flex w-full items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <SidebarToggleButton />

        <Link to="/" className="text-xl font-bold text-base-content">
          Gennio 2
        </Link>
      </div>

      <nav className="flex items-center gap-4 text-sm text-base-content/80">
        <ThemeSwitch />

        {isAuth && (
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline">{user.email}</span>
            )}
            <button
              onClick={onLogout}
              className="rounded-field bg-primary px-3 py-1.5 text-primary-content hover:bg-primary/80"
            >
              Выйти
            </button>
          </div>
        )}

        {!isAuth && location.pathname !== "/login" && (
          <Link
            to="/login"
            className="rounded-field bg-primary px-3 py-1.5 text-primary-content hover:bg-primary/80"
          >
            Войти
          </Link>
        )}
      </nav>
    </div>
  );
}
