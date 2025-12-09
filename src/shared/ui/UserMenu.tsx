import * as React from "react";
import { LogOut } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/ui/shadcn/popover";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import Button from "./Button";
import { useAuth } from "@/features/auth/useAuth";
import { cn } from "@/lib/utils";
import { selectAppTheme } from "@/features/app/appSlice";
import { useNavigate } from "react-router-dom";
import { AppRoute } from "../config/routes";
import ThemeSwitch from "./ThemeSwitch";

export function UserMenu() {
  const { user } = useAuth();
  const theme = useAppSelector(selectAppTheme);
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      /* no-op */
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full text-white
          font-bold select-none cursor-pointer"
          style={{
            background: `
          linear-gradient(
            to top,
            #C2185B,
            #DA739B
          )
        `,
          }}
        >
          {user.email.slice(0, 2).toUpperCase()}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className={cn(
          "flex flex-col mt-1.5 gap-2 p-4 min-w-[10rem] right-1",
          theme === "dark" ? "glass-panel-dark" : "glass-panel-light"
        )}
      >
        {user?.email && (
          <>
            <div>
              <span>{user.email}</span>
            </div>

            <Button
              className="p-0 text-base font-thin"
              contentClassName="p-0 justify-start text-base font-thin"
              size="sm"
              color="ghost"
              onClick={() => {
                navigate(AppRoute.MY_GENERATIONS);
                setOpen(false);
              }}
            >
              Мои генерации
            </Button>

            {user.role === "admin" && (
              <div className="mt-1">
                <ThemeSwitch />
              </div>
            )}

            <div className="divider my-0.5" />
          </>
        )}

        <div>
          <Button
            onClick={onLogout}
            className="flex items-center gap-3 text-error px-0"
            color="ghost"
            size="sm"
          >
            <span className="text-base font-normal">Выйти</span> <LogOut />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
