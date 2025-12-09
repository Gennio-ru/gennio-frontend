import { Link, NavLink, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useAuth } from "@/features/auth/useAuth";
import { SidebarToggleButton } from "../layouts/Sidebar";
import { selectAppTheme, setPaymentModalOpen } from "@/features/app/appSlice";
import darkLogo from "/gennio-logo-dark.webp";
import lightLogo from "/gennio-logo-light.webp";
import tokenDarkLogo from "@/assets/token-dark-logo.webp";
import tokenLightLogo from "@/assets/token-light-logo.webp";
import { UserMenu } from "../ui/UserMenu";
import { useMemo } from "react";
import { adminHeaderMenu, primaryHeaderMenu } from "../config/menu";
import { cn } from "@/lib/utils";
import ThemeSwitch from "../ui/ThemeSwitch";
import Button from "../ui/Button";
import { setAuthModalOpen } from "@/features/auth/authSlice";
import { getUrlRootSegment } from "@/lib/helpers";
import { AppRoute } from "../config/routes";
import { PlusIcon } from "lucide-react";
import { Tooltip } from "../ui/Tooltip";

export default function HeaderNav() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectAppTheme);
  const location = useLocation();
  const { isAuth, user } = useAuth();

  const currentRoot = getUrlRootSegment(location.pathname);

  const showAdminMenu = useMemo(() => {
    return user?.role === "admin" && location.pathname.startsWith("/admin");
  }, [user?.role, location.pathname]);

  const menuItems = useMemo(
    () => (showAdminMenu ? adminHeaderMenu : primaryHeaderMenu),
    [showAdminMenu]
  );

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-2 w-full">
      {/* 🔹 Левая часть (бургер + логотип) — 2 колонки на md+, 6 на мобилках */}
      <div
        className={cn(
          "col-span-6 flex items-center gap-4",
          showAdminMenu ? "lg:col-span-2" : "md:col-span-2"
        )}
      >
        <SidebarToggleButton />

        <Link
          to={AppRoute.MAIN}
          className="text-xl font-bold text-base-content"
        >
          <img
            src={theme === "dark" ? darkLogo : lightLogo}
            className="h-[30px] min-w-[97px] w-auto object-contain"
            alt="Gennio"
          />
        </Link>
      </div>

      {/* 🔹 Центральная часть (меню) — 8 колонок, скрыто до md */}
      <nav
        className={cn(
          "hidden items-center justify-start gap-8 text-sm",
          showAdminMenu ? "lg:flex lg:col-span-6" : "md:flex md:col-span-6"
        )}
      >
        {menuItems.map((item) => {
          const itemRoot = getUrlRootSegment(item.href);
          const active = itemRoot === currentRoot;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "relative block py-1 text-base transition-colors text-nowrap",
                  (showAdminMenu ? isActive : active)
                    ? "before:absolute before:left-0 before:right-0 before:bottom-[-14px] \
                 before:h-[2px] before:bg-primary before:content-[''] \
                 before:scale-x-100 before:origin-left before:transition-transform \
                 before:duration-200 before:ease-in-out"
                    : "text-base-content hover:before:absolute hover:before:left-0 hover:before:right-0 \
                 hover:before:bottom-[-14px] hover:before:h-[2px] hover:before:bg-primary \
                 hover:before:content-[''] before:scale-x-0 before:origin-left \
                 before:transition-transform before:duration-200 before:ease-in-out \
                 hover:before:scale-x-100"
                )
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* 🔹 Правая часть (UserMenu / Войти) — 6 колонок на мобилках, 2 на md+ */}
      <div
        className={cn(
          "col-span-6 flex justify-end items-center gap-6 text-sm text-base-content/80",
          showAdminMenu ? "lg:col-span-4" : "md:col-span-4"
        )}
      >
        {!showAdminMenu && isAuth && (
          <Tooltip content="Пополнить токены">
            <Button
              size="sm"
              className={cn(
                "relative rounded-full h-5.5 max-h-5.5 pl-6.5 pr-[5px] text-base-content",
                theme === "dark"
                  ? "bg-base-content/10"
                  : "bg-white/70 hover:text-white"
              )}
              contentClassName="gap-1.5"
              onClick={() => dispatch(setPaymentModalOpen(true))}
            >
              <img
                src={theme === "dark" ? tokenDarkLogo : tokenLightLogo}
                className="absolute h-[26px] w-[26px] left-[-6px] top-[-2px]"
                alt="token-logo"
              />

              <span className="font-regular text-base relative top-[-0.5px]">
                {user.tokens}
              </span>

              <PlusIcon
                size={15}
                strokeWidth={2}
                className="relative top-[-1px]"
              />
            </Button>
          </Tooltip>
        )}

        {!isAuth && user?.role === "admin" && <ThemeSwitch />}

        {isAuth ? (
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        ) : (
          location.pathname !== "/login" && (
            <Button
              color="primary"
              size="sm"
              onClick={() => dispatch(setAuthModalOpen(true))}
            >
              Войти
            </Button>
          )
        )}
      </div>
    </div>
  );
}
