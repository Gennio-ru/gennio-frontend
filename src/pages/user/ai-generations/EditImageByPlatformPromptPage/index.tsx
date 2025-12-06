import { apiAIUploadFile } from "@/api/modules/files";
import { apiStartImageEditByPromptId } from "@/api/modules/model-job";
import { apiGetPrompt, type Prompt } from "@/api/modules/prompts";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { route } from "@/shared/config/routes";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import Loader from "@/shared/ui/Loader";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().optional(),
  inputFileId: z.string().min(1, "Загрузите изображение"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function EditImageByPlatformPromptPage() {
  const dispatch = useDispatch();
  const { promptId } = useParams<{ promptId: string }>();
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();

  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: { text: "", inputFileId: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const inputFileId = useWatch({ control, name: "inputFileId" });

  useEffect(() => {
    if (!promptId) return;
    setIsLoading(true);
    apiGetPrompt(promptId)
      .then((res) => {
        setCurrentPrompt(res);
      })
      .finally(() => setIsLoading(false));
  }, [promptId]);

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptId({
        ...data,
        promptId,
        text: data.text || null,
        model: "OPENAI",
      });
      ymGoal("generate_by_platform_prompt");
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <AIGenerationTitle
        title={currentPrompt.title}
        description={currentPrompt.description}
      />

      <GlassCard className="w-full mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-6 text-base-content"
        >
          <h1 className="text-xl font-semibold">Загрузка фото</h1>

          {/* Референс */}
          <div className="relative mb-0">
            <Controller
              name="inputFileId"
              control={control}
              render={({ field }) => (
                <ImageUploadWithCrop
                  fromToImagesUrls={
                    currentPrompt.beforePreviewImageUrl &&
                    currentPrompt.afterPreviewImageUrl
                      ? [
                          currentPrompt.beforePreviewImageUrl,
                          currentPrompt.afterPreviewImageUrl,
                        ]
                      : undefined
                  }
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
          {inputFileId && (
            <div className="relative mt-8 mb-0">
              <div className="mb-3 text-base">
                Введите детали (если необходимо)
              </div>

              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={2}
                    placeholder="Например: Добавь красный колпак на голову"
                    className="w-full rounded-field bg-base-100/60"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("text");
                    }}
                    errored={!!errors.text}
                    errorMessage={errors.text?.message}
                    maxLength={300}
                  />
                )}
              />
            </div>
          )}

          {/* Кнопка */}
          <div className="flex justify-center">
            {isAuth && user.tokens > 0 && inputFileId && (
              <Button
                type="submit"
                disabled={isBusy}
                className="mt-8 px-6 w-[200px]"
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
                className="mt-8 px-6 w-[200px]"
                onClick={() => dispatch(setAuthModalOpen(true))}
              >
                Войти в аккаунт
              </Button>
            )}

            {isAuth && user.tokens === 0 && (
              <Button
                type="button"
                className="mt-8 px-6 w-[200px]"
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
