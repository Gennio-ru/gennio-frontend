import {
  apiStartImageGenerateByPromptText,
  ModelType,
} from "@/api/modules/model-job";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { cn } from "@/lib/utils";
import { route } from "@/shared/config/routes";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import { AspectRatioSegmentedControl } from "@/shared/ui/AspectRatioSegmentedControl";
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
  aspectRatio: z.string().nullable(),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function GenerateImagePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  const { isAuth, user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: { text: "", aspectRatio: null },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageGenerateByPromptText({
        ...data,
        aspectRatio: data.aspectRatio || undefined,
      });
      ymGoal("generate_image");
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
    <>
      <AIGenerationTitle
        title="Создавайте изображения с&nbsp;нуля"
        description="Используйте свой текстовый запрос для создания уникального изображения"
      />

      <GlassCard className="w-full mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 text-base-content"
        >
          {!isAuth && (
            <div className={cn("text-[18px] text-warning text-center")}>
              Войдите в аккаунт, чтобы начать редактирование
            </div>
          )}

          {isAuth && user.tokens === 0 && (
            <div className={cn("text-[18px] text-warning text-center")}>
              Пополните баланс токенов, чтобы начать редактирование
            </div>
          )}

          {/* Промпт */}
          <div className="relative mb-4">
            <div className="mb-3 text-lg font-medium">Описание изображения</div>

            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="Например: “рыжий котик на подоконнике, мягкий свет, реалистичный стиль"
                  className="w-full rounded-field bg-base-100/60"
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors("text");
                  }}
                  maxLength={700}
                  errored={!!errors.text}
                  errorMessage={errors.text?.message}
                />
              )}
            />
          </div>

          {/* Формат */}
          <div className="relative mb-0 mt-4 flex flex-col items-start gap-2">
            <div className="text-lg font-medium">Формат изображения</div>

            <Controller
              name="aspectRatio"
              control={control}
              render={({ field }) => (
                <AspectRatioSegmentedControl
                  {...field}
                  model={ModelType.OPENAI}
                  size="xs"
                  variant="surface"
                />
              )}
            />
          </div>

          {/* Кнопка */}
          <div className="flex justify-center">
            {isAuth && user.tokens > 0 && (
              <Button
                type="submit"
                disabled={isBusy}
                className="mt-12 px-6 w-[200px]"
              >
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
                className="mt-12 px-6 w-[200px]"
                onClick={() => dispatch(setAuthModalOpen(true))}
              >
                Войти в аккаунт
              </Button>
            )}

            {isAuth && user.tokens === 0 && (
              <Button
                type="button"
                className="mt-12 px-6 w-[200px]"
                onClick={() => dispatch(setPaymentModalOpen(true))}
              >
                Пополнить токены
              </Button>
            )}
          </div>
        </form>
      </GlassCard>
    </>
  );
}
