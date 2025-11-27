import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { EyeIcon, EyeClosedIcon } from "lucide-react";
import { apiRegister } from "@/api/modules/auth";

const passwordSchema = z
  .string()
  .min(8, "Минимум 8 символов")
  .max(64, "Максимум 64 символа");

const schema = z
  .object({
    email: z.string().email("Некорректный email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  // Проверка совпадения паролей
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })
  // Не допускаем пароль, совпадающий с email
  .refine((data) => data.password.toLowerCase() !== data.email.toLowerCase(), {
    message: "Пароль не должен совпадать с email",
    path: ["password"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  onSuccess?: () => void;
  // После успешной регистрации сразу показываем таб подтверждения почты
  onRequireEmailConfirm?: (email: string) => void;
};

function scorePassword(pw: string) {
  if (!pw) return 0;

  let score = 0;

  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;

  if (/[0-9]/.test(pw)) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
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

export function AuthRegistrationForm({
  onSuccess,
  onRequireEmailConfirm,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    resetOptions: {
      keepErrors: false,
    },
  });

  const passwordValue = watch("password") ?? "";
  const s = scorePassword(passwordValue);

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await apiRegister({ email: data.email, password: data.password });

      onRequireEmailConfirm?.(data.email);
      onSuccess?.();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setServerError(e.message);
      } else {
        setServerError("Регистрация не удалась");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      {serverError && (
        <div className="rounded-lg bg-error/10 p-2 text-sm text-error">
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="relative space-y-1">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              placeholder="you@example.com"
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
      <div className="space-y-2">
        <div className="relative">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={showPwd ? "text" : "password"}
                placeholder="Пароль"
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
                    s <= 2 ? "bg-error" : s === 3 ? "bg-warning" : "bg-success",
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
            <li className={passwordValue.length >= 8 ? "text-success" : ""}>
              • Минимум 8 символов
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
          {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </Button>
      </div>
    </form>
  );
}
