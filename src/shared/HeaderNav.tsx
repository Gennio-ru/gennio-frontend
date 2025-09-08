import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import ThemeSwitch from "./ThemeSwitch";

export default function HeaderNav() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAppSelector((s) => s.auth);
  const isAuthed = Boolean(token);

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
        gennio
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <ThemeSwitch />

        {isAuthed && (
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
              Logout
            </button>
          </div>
        )}

        {!isAuthed && location.pathname !== "/login" && (
          <Link
            to="/login"
            className="rounded-xl bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-950"
          >
            Login
          </Link>
        )}
      </nav>
    </div>
  );
}
