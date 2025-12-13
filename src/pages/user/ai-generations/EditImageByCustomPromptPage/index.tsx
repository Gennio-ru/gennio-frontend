import { apiAIUploadFile } from "@/api/modules/files";
import {
  apiStartImageEditByPromptText,
  ModelType,
} from "@/api/modules/model-job";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { route } from "@/shared/config/routes";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import { AspectRatioSegmentedControl } from "@/shared/ui/AspectRatioSegmentedControl";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
  inputFileId: z.string().min(1, "Загрузите изображение"),
  aspectRatio: z.string().nullable(),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function EditImageByCustomPromptPage() {
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
    defaultValues: { text: "", inputFileId: "", aspectRatio: null },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptText({
        ...data,
        aspectRatio: data.aspectRatio || undefined,
      });
      ymGoal("generate_by_custom_prompt");
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
        title="Редактируйте по&#8209;своему"
        description="Загружайте фото и изменяйте их с помощью своих индивидуальных промптов"
      />

      <GlassCard className="w-full max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7 text-base-content"
        >
          <h2 className="text-lg font-medium">Загрузка фото</h2>
          {/* Референс */}
          <div className="relative mb-0">
            <Controller
              name="inputFileId"
              control={control}
              render={({ field }) => (
                <ImageUploadWithCrop
                  onChange={(value) => {
                    if (value === null) {
                      field.onChange("");
                    }
                  }}
                  onUpload={async (file) => {
                    clearErrors("inputFileId");

                    if (!file) {
                      throw new Error("Файл не передан");
                    }

                    try {
                      const res = await apiAIUploadFile(file);

                      if (!res || !res.id || !res.url) {
                        throw new Error("Не удалось загрузить файл");
                      }

                      field.onChange(res.id);
                      return res;
                    } catch (e) {
                      if (checkApiResponseErrorCode(e, "UNAUTHORIZED")) {
                        customToast.error(e);
                      }
                    }
                  }}
                />
              )}
            />

            {errors.inputFileId && (
              <p className="absolute top-full mt-1 text-xs text-error">
                {errors.inputFileId.message}
              </p>
            )}
          </div>

          {/* Промпт */}
          <div className="relative mb-0 mt-8">
            <div className="mb-3 text-lg font-medium">Описание изображения</div>

            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="Например: “Замени фон на лес, сохрани человека без изменений”"
                  className="w-full rounded-field bg-base-100/60"
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors("text");
                  }}
                  errored={!!errors.text}
                  errorMessage={errors.text?.message}
                  maxLength={700}
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
                  model={ModelType.GEMINI}
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
                {isSubmitting ? "Загрузка..." : "Сгенерировать"}
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
