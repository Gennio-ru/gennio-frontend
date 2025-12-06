import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { apiRequestPasswordReset } from "@/api/modules/auth";

const schema = z.object({
  email: z.string().email("Некорректный email"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  onBackToLogin?: () => void;
};

async function requestPasswordResetStub(email: string): Promise<void> {
  await apiRequestPasswordReset({ email });
}

export function AuthResetPasswordForm({ onBackToLogin }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async ({ email }: FormValues) => {
    setServerError(null);
    try {
      await requestPasswordResetStub(email);
      setIsDone(true);
    } catch (e) {
      if (e instanceof Error) {
        setServerError(e.message);
      } else {
        setServerError("Не удалось отправить письмо. Попробуйте ещё раз.");
      }
    }
  };

  if (isDone) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold text-base-content">
            Ссылка для восстановления отправлена
          </h2>
          <p className="text-sm text-base-content/70">
            Если такой email есть в системе, мы отправили на него письмо с
            инструкцией по смене пароля.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="button" onClick={onBackToLogin}>
            Вернуться ко входу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
      {serverError && (
        <div className="rounded-lg bg-error/10 p-2 text-sm text-error">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-base-content/70">
          Укажите email, который вы использовали при регистрации. Мы отправим на
          него ссылку для смены пароля.
        </p>

        <div className="relative">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder="Почта"
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
      </div>

      <div className="flex flex-col gap-3">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Отправляем письмо…" : "Отправить ссылку"}
        </Button>
      </div>
    </form>
  );
}
