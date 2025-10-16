import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { useAppDispatch } from "@/app/hooks";
import { loginThunk, meThunk } from "@/features/auth/authSlice";
import { apiRegister } from "@/api/auth";
import { EyeIcon, EyeClosedIcon } from "lucide-react";

// Требования к паролю: мин. 12 символов, латиница (верх/низ), цифра, спецсимвол, без пробелов.
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
    email: z.string().email("Некорректный email"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

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

export default function RegistrationForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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
      await dispatch(
        loginThunk({ email: data.email, password: data.password })
      ).unwrap();
      await dispatch(meThunk());
      navigate("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setServerError(e.message);
      } else {
        setServerError("Регистрация не удалась");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full rounded-2xl bg-base-100 p-6"
    >
      <h1 className="text-lg font-semibold mb-8">Регистрация</h1>

      {serverError && (
        <div className="rounded-lg bg-error/10 p-2 text-sm text-error">
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="relative mt-5 mb-8 space-y-1">
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
            />
          )}
        />

        {errors.email && (
          <p className="absolute top-full text-xs text-error">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1 mb-8">
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
          <ul className="text-xs text-base-content/70 space-y-0.5 mt-3">
            <li className={passwordValue.length >= 12 ? "text-success" : ""}>
              • Минимум 12 символов
            </li>
            <li className={/[a-z]/.test(passwordValue) ? "text-success" : ""}>
              • Строчная латиница (a–z)
            </li>
            <li className={/[A-Z]/.test(passwordValue) ? "text-success" : ""}>
              • Прописная латиница (A–Z)
            </li>
            <li className={/[0-9]/.test(passwordValue) ? "text-success" : ""}>
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

        {errors.confirmPassword && (
          <p className="absolute top-full mt-1 text-xs text-error">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-10">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </Button>
        <Link to="/login" className="text-primary hover:underline">
          Войти
        </Link>
      </div>
    </form>
  );
}
