import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { loginThunk, meThunk } from "@/features/auth/authSlice";
import { EyeIcon, EyeClosedIcon } from "lucide-react";

// схема валидации
const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.auth.status);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

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

  const onSubmit = async (data: FormValues) => {
    setServerError(null);
    try {
      await dispatch(loginThunk(data)).unwrap();
      await dispatch(meThunk());
      navigate("/");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setServerError(e.message);
      } else {
        setServerError("Вход не удался");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="no"
      className="mx-auto w-full max-w-sm space-y-5 rounded-2xl bg-base-100 p-6"
    >
      <h1 className="text-lg font-semibold text-base-content">Вход</h1>

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
            />
          )}
        />
        {errors.email && (
          <p className="absolute top-full mt-0.5 text-xs text-error">
            {errors.email.message}
          </p>
        )}
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

        {errors.password && (
          <p className="absolute top-full mt-0.5 text-xs text-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button disabled={isSubmitting || status === "loading"}>
          {isSubmitting || status === "loading" ? "Вход…" : "Войти"}
        </Button>
        <Link to="/registration" className="text-primary hover:underline">
          Регистрация
        </Link>
      </div>
    </form>
  );
}
