import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/ui/shadcn/popover";
import { useAppDispatch } from "@/app/hooks";
import { logoutThunk } from "@/features/auth/authSlice";
import Button from "./Button";
import { useAuth } from "@/features/auth/useAuth";

export function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigate("/login");
    } catch {
      /* no-op */
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" color="ghost">
          <MoreHorizontal />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex flex-col gap-2 p-4 min-w-[10rem]"
      >
        {user?.email && <span className="sm:hidden">{user.email}</span>}

        <div>Генераций осталось: {user.credits}</div>

        <Button onClick={onLogout} className="mt-2">
          Выйти
        </Button>
      </PopoverContent>
    </Popover>
  );
}
