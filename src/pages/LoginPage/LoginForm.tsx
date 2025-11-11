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
import YandexLogo from "@/assets/yandex-logo.svg?react";
import GlassCard from "@/shared/ui/GlassCard";

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
    <>
      <GlassCard className="w-full h-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="no"
          className="w-full space-y-8"
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

          <div className="flex items-center justify-between mt-8">
            <Button disabled={isSubmitting || status === "loading"}>
              {isSubmitting || status === "loading" ? "Вход…" : "Войти"}
            </Button>

            <Link to="/registration" className="text-primary hover:underline">
              Регистрация
            </Link>
          </div>
        </form>
      </GlassCard>

      <div className="divider before:h-px after:h-px my-0 text-base-content/50 before:bg-base-300 after:bg-base-300">
        или
      </div>

      <a
        href={`${import.meta.env.VITE_API_URL}/auth/yandex`}
        className="w-full h-10 flex items-center justify-center rounded-box bg-black text-white cursor-pointer hover:bg-neutral-800 transition-colors"
      >
        <YandexLogo fontSize={24} className="mr-2" />
        Войти c Яндекс ID
      </a>
    </>
  );
}
