import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectAuthModalOpen,
  setAuthModalOpen,
} from "@/features/auth/authSlice";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { AuthLoginForm } from "./AuthLoginForm";
import { AuthRegistrationForm } from "./AuthRegistrationForm";
import { selectAppTheme } from "@/features/app/appSlice";

type Mode = "login" | "register";

export default function AuthModal() {
  const theme = useAppSelector(selectAppTheme);
  const dispatch = useAppDispatch();
  const authModalOpen = useAppSelector(selectAuthModalOpen);
  const [mode, setMode] = useState<Mode>("login");

  const handleClose = () => {
    dispatch(setAuthModalOpen(false));
    setMode("login"); // при закрытии возвращаем модалку на "Вход"
  };

  return (
    <Dialog
      open={authModalOpen}
      onOpenChange={(v) => {
        if (!v) {
          handleClose();
        } else {
          dispatch(setAuthModalOpen(true));
        }
      }}
    >
      <DialogContent
        className={cn("sm:max-w-md", theme === "dark" && "bg-base-100/70")}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-4">
          <DialogTitle className="mx-auto mb-5 flex gap-10">
            <button
              type="button"
              className={cn(
                "pb-1 text-base cursor-pointer",
                mode === "login"
                  ? "border-b-2 border-primary text-base-content"
                  : "border-b-2 border-transparent text-base-content/60 hover:text-base-content"
              )}
              onClick={() => setMode("login")}
            >
              Вход
            </button>
            <button
              type="button"
              className={cn(
                "pb-1 text-base cursor-pointer",
                mode === "register"
                  ? "border-b-2 border-primary text-base-content"
                  : "border-b-2 border-transparent text-base-content/60 hover:text-base-content"
              )}
              onClick={() => setMode("register")}
            >
              Регистрация
            </button>
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0"
            onClick={handleClose}
          >
            <XIcon size={24} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        {mode === "login" ? (
          <AuthLoginForm onSuccess={handleClose} />
        ) : (
          <AuthRegistrationForm onSuccess={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
