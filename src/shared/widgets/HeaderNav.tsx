import { Link, useLocation } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import ThemeSwitch from "../ui/ThemeSwitch";
import { useAuth } from "@/features/auth/useAuth";
import { SidebarToggleButton } from "../layouts/Sidebar";
import { selectAppTheme } from "@/features/app/appSlice";
import darkLogo from "../../assets/gennio-logo-dark.png";
import lightLogo from "../../assets/gennio-logo-light.png";
import { UserMenu } from "../ui/UserMenu";

export default function HeaderNav() {
  const theme = useAppSelector(selectAppTheme);
  const location = useLocation();
  const { isAuth, user } = useAuth();

  return (
    <div className="flex w-full items-center justify-between py-2">
      <div className="flex items-center gap-4">
        <SidebarToggleButton />

        <Link to="/" className="text-xl font-bold text-base-content">
          <img
            src={theme === "dark" ? darkLogo : lightLogo}
            className="h-[30px]"
          />
        </Link>
      </div>

      <nav className="flex items-center gap-4 text-sm text-base-content/80">
        <ThemeSwitch />

        {isAuth && (
          <div className="flex items-center gap-3">
            {user?.email && (
              <span className="hidden sm:inline">{user.email}</span>
            )}
            <UserMenu />
          </div>
        )}

        {!isAuth && location.pathname !== "/login" && (
          <Link
            to="/login"
            className="rounded-field bg-primary px-3 py-1.5 color-primary-content hover:bg-primary/80"
          >
            Войти
          </Link>
        )}
      </nav>
    </div>
  );
}
