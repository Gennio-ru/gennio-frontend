import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setResetPasswordModalOpen,
  selectResetPasswordModalOpen,
} from "@/features/auth/authSlice";
import { EyeClosedIcon, EyeIcon, XIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import Input from "../Input";
import Button from "../Button";
import { useLocation, useNavigate } from "react-router-dom";
import { apiConfirmPasswordReset } from "@/api/modules/auth";

const passwordSchema = z
  .string()
  .min(12, "Минимум 12 символов")
  .regex(/[a-z]/, "Нужна строчная латинская буква")
  .regex(/[A-Z]/, "Нужна прописная латинская буква")
  .regex(/[0-9]/, "Нужна цифра")
  .regex(/[^A-Za-z0-9]/, "Нужен спецсимвол")
  .refine((v) => v.length === 0 || !/\s/.test(v), "Без пробелов");

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
}

function strengthLabel(score: number) {
  switch (score) {
    case 0:
    case 1:
    case 2:
      return "Слабый";
    case 3:
      return "Средний";
    case 4:
      return "Сильный";
    case 5:
      return "Очень сильный";
    default:
      return "";
  }
}

type FormValues = z.infer<typeof schema>;

export default function PasswordResetModal() {
  const resetModalOpen = useAppSelector(selectResetPasswordModalOpen);
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const isResetRoute = location.pathname === "/auth/password-reset";
  const hasTokenParams = Boolean(userId && token);

  const open = isResetRoute ? true : resetModalOpen;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resetOptions: {
      keepErrors: false,
    },
  });

  const passwordValue = watch("password") ?? "";
  const s = scorePassword(passwordValue);

  useEffect(() => {
    if (isResetRoute && hasTokenParams) {
      dispatch(setResetPasswordModalOpen(true));
    }
  }, [isResetRoute, hasTokenParams, dispatch]);

  const cleanUrlIfHasToken = () => {
    if (userId || token) {
      // чистим query, чтобы токен не висел в адресной строке
      navigate("/", { replace: true });
    }
  };

  const handleClose = () => {
    dispatch(setResetPasswordModalOpen(false));
    setServerError(null);
    reset({ password: "", confirmPassword: "" });
    cleanUrlIfHasToken();
  };

  const onSubmit = async ({ password }: FormValues) => {
    setServerError(null);

    if (!userId || !token) {
      setServerError("Ссылка недействительна или устарела");
      return;
    }

    try {
      await apiConfirmPasswordReset({
        userId,
        token,
        password,
      });

      // закрываем модалку, чистим URL и открываем модалку входа
      dispatch(setResetPasswordModalOpen(false));
      cleanUrlIfHasToken();
      reset({ password: "", confirmPassword: "" });
    } catch (e: unknown) {
      if (e instanceof Error) {
        setServerError(e.message || "Не удалось сохранить пароль");
      } else {
        setServerError("Не удалось сохранить пароль. Попробуйте ещё раз.");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="relative">
          <DialogTitle className="mx-auto mb-5 mt-1 flex gap-10">
            Восстановление пароля
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={handleClose}
          >
            <XIcon size={24} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
          {serverError && (
            <div className="rounded-lg bg-error/10 p-2 text-sm text-error">
              {serverError}
            </div>
          )}

          {/* Password */}
          <div className="space-y-2">
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type={showPwd ? "text" : "password"}
                    placeholder="Новый пароль"
                    autoComplete="new-password"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("password");
                    }}
                    errored={!!errors.password}
                  />
                )}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm text-base-content/60 hover:text-base-content cursor-pointer"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPwd ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error">{errors.password.message}</p>
            )}

            {/* Индикатор силы */}
            <div className="space-y-1">
              {passwordValue.trim().length > 0 && (
                <>
                  <div className="h-2 w-full overflow-hidden rounded bg-base-200">
                    <div
                      className={[
                        "h-2 transition-all",
                        s <= 2
                          ? "bg-error"
                          : s === 3
                          ? "bg-warning"
                          : "bg-success",
                      ].join(" ")}
                      style={{ width: `${(s / 5) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-base-content/70">
                    Защита: {strengthLabel(s)}
                  </div>
                </>
              )}
              <ul className="mt-3 space-y-0.5 text-xs text-base-content/70">
                <li
                  className={passwordValue.length >= 12 ? "text-success" : ""}
                >
                  • Минимум 12 символов
                </li>
                <li
                  className={/[a-z]/.test(passwordValue) ? "text-success" : ""}
                >
                  • Строчная латиница (a–z)
                </li>
                <li
                  className={/[A-Z]/.test(passwordValue) ? "text-success" : ""}
                >
                  • Прописная латиница (A–Z)
                </li>
                <li
                  className={/[0-9]/.test(passwordValue) ? "text-success" : ""}
                >
                  • Цифра (0–9)
                </li>
                <li
                  className={
                    /[^A-Za-z0-9]/.test(passwordValue) ? "text-success" : ""
                  }
                >
                  • Спецсимвол (например, !@#$%^&*)
                </li>
                <li
                  className={
                    passwordValue.trim().length > 0 && !/\s/.test(passwordValue)
                      ? "text-success"
                      : ""
                  }
                >
                  • Без пробелов
                </li>
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type={showPwd2 ? "text" : "password"}
                  placeholder="Подтвердите пароль"
                  autoComplete="new-password"
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors("confirmPassword");
                  }}
                  errored={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword?.message}
                />
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm text-base-content/60 hover:text-base-content cursor-pointer"
              onClick={() => setShowPwd2((v) => !v)}
              aria-label={showPwd2 ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPwd2 ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <Button disabled={isSubmitting}>
              {isSubmitting ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
