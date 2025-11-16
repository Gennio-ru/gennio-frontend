import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk, meThunk } from "@/features/auth/authSlice";
import YandexLogo from "@/assets/yandex-logo.svg?react";
import { useLocation } from "react-router-dom";
import { isErrorResponseDto } from "@/api/isErrorResponse";

// схема валидации
const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
  // при ошибке EMAIL_NOT_CONFIRMED переключаемся на таб подтверждения
  onRequireEmailConfirm?: (email: string, lockResend: boolean) => void;
};

export function AuthLoginForm({ onSuccess, onRequireEmailConfirm }: Props) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const returnUrl = location.pathname + location.search + location.hash;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (formValues: FormValues) => {
    setServerError(null);

    try {
      await dispatch(loginThunk(formValues)).unwrap();
      await dispatch(meThunk()).unwrap();
      onSuccess?.();
    } catch (e: unknown) {
      // бизнес-ошибка: email не подтверждён
      if (isErrorResponseDto(e) && e.error.code === "EMAIL_NOT_CONFIRMED") {
        onRequireEmailConfirm?.(formValues.email, false);
        return;
      }

      if (e instanceof Error) {
        setServerError(e.message);
        return;
      }

      setServerError("Вход не удался");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="no"
      className="w-full space-y-8"
    >
      {serverError && (
        <div className="rounded-lg bg-error p-2 text-sm text-error-content">
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="relative">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              placeholder="you@example.com"
              autoComplete="no"
              onChange={(e) => {
                field.onChange(e);
                clearErrors("email");
              }}
              errored={!!errors.email}
              errorMessage={errors.email?.message}
            />
          )}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type={showPwd ? "text" : "password"}
              placeholder="Пароль"
              autoComplete="current-password"
              onChange={(e) => {
                field.onChange(e);
                clearErrors("password");
              }}
              errored={!!errors.password}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <button
          type="button"
          className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm cursor-pointer"
          onClick={() => setShowPwd((v) => !v)}
          aria-label={showPwd ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPwd ? <EyeClosedIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      <div className="flex justify-center mt-8">
        <Button className="px-10" disabled={isSubmitting}>
          {isSubmitting ? "Вход…" : "Войти"}
        </Button>
      </div>

      <div className="divider my-8">или</div>

      <a
        href={`${
          import.meta.env.VITE_API_URL
        }/auth/yandex?returnUrl=${encodeURIComponent(returnUrl)}`}
        className="w-full h-12 flex items-center justify-center rounded-box bg-black text-white cursor-pointer hover:bg-neutral-800 transition-colors"
      >
        <YandexLogo fontSize={24} className="mr-2" />
        Войти с Яндекс ID
      </a>
    </form>
  );
}
