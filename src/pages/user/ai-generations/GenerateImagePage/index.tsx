import { apiStartImageGenerateByPromptText } from "@/api/modules/model-job";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { route } from "@/shared/config/routes";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function GenerateImagePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  const { isAuth } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: { text: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageGenerateByPromptText({
        ...data,
        model: "OPENAI",
      });
      dispatch(setUser(res.user));
      navigate(route.jobWait(res));
    } catch (e) {
      if (checkApiResponseErrorCode(e, "TOKENS_NOT_ENOUGH")) {
        dispatch(setPaymentModalOpen(true));
        return;
      }

      customToast.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <GlassCard className="mx-auto w-full max-w-2xl mt-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 text-base-content"
      >
        {!isAuth && (
          <div className={cn("text-[18px] sm:px-30 text-warning text-center")}>
            Войдите в аккаунт, чтобы загрузить фото и&nbsp;начать редактирование
          </div>
        )}

        {/* Промпт */}
        <div className="relative mb-6">
          <div className="mb-3 text-xl">Введите текст промпта</div>

          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="Например: “рыжий котик на подоконнике, мягкий свет, реалистичный стиль"
                className="w-full rounded-field"
                onChange={(e) => {
                  field.onChange(e);
                  clearErrors("text");
                }}
                errored={!!errors.text}
                errorMessage={errors.text?.message}
              />
            )}
          />
        </div>

        {/* Кнопка */}
        <div className="pt-4 flex justify-center">
          {isAuth && (
            <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
              {isSubmitting
                ? "Загрузка…"
                : isFetching
                ? "Загрузка…"
                : "Сгенерировать"}
            </Button>
          )}

          {!isAuth && (
            <Button
              type="button"
              className="px-6 w-[200px]"
              onClick={() => dispatch(setAuthModalOpen(true))}
            >
              Войти в аккаунт
            </Button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
