import { apiAIUploadFile } from "@/api/modules/files";
import { apiStartImageEditByPromptId } from "@/api/modules/model-job";
import { PROVIDER_COST_OBJECT } from "@/api/modules/pricing";
import { apiGetPrompt, type Prompt } from "@/api/modules/prompts";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode, declOfNum } from "@/lib/helpers";
import { ymGoal } from "@/lib/metrics/yandexMetrika";
import { route } from "@/shared/config/routes";
import { AIGenerationTitle } from "@/shared/ui/AIGenerationTitle";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import Loader from "@/shared/ui/Loader";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().optional(),
  inputFileIds: z.array(z.string()).length(1, "Загрузите изображениe"),
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
    defaultValues: { text: "", inputFileIds: [] },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const inputFileId = useWatch({ control, name: "inputFileIds" });

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
    if (!isAuth) {
      dispatch(setAuthModalOpen(true));
      return;
    }

    if (isAuth && user.tokens === 0) {
      dispatch(setPaymentModalOpen(true));
      return;
    }

    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptId({
        ...data,
        promptId,
        text: data.text || null,
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

  const { standard: standardPrice } = PROVIDER_COST_OBJECT["OPENAI"]["edit"];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <AIGenerationTitle
        title={currentPrompt.title}
        description={currentPrompt.description}
      />

      <div className="max-w-2xl mx-auto w-full">
        {currentPrompt.model === "OPENAI" && (
          <div className="text-xs text-base-content/60 mb-3 -mt-5 flex gap-1.5">
            <CircleAlert
              size={16}
              className="min-w-[18px] relative top-[-1px] rotate-180"
            />

            <div className="">
              <p>В этом шаблоне портретное сходство не&nbsp;гарантировано</p>
              {/* <p>сходство не гарантировано</p> */}
            </div>
          </div>
        )}
      </div>

      <GlassCard className="w-full mx-auto max-w-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-6 text-base-content"
        >
          <h1 className="text-lg font-medium">Загрузка фото</h1>

          {/* Референс */}
          <div className="relative mb-0">
            <Controller
              name="inputFileIds"
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
                    const files = Array.isArray(value)
                      ? value
                      : value
                      ? [value]
                      : [];
                    field.onChange(files.map((f) => f.id));
                    if (files.length) clearErrors("inputFileIds");
                  }}
                  onUpload={async (file) => {
                    clearErrors("inputFileIds");

                    if (!file) {
                      throw new Error("Файл не передан");
                    }

                    try {
                      const res = await apiAIUploadFile(file);

                      if (!res || !res.id || !res.url) {
                        throw new Error("Не удалось загрузить файл");
                      }

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

            {errors.inputFileIds && (
              <p className="absolute top-full mt-1 text-xs text-error">
                {errors.inputFileIds.message}
              </p>
            )}
          </div>

          {/* Промпт */}
          {inputFileId && (
            <div className="relative mt-8 mb-0">
              <div className="mb-3 text-lg font-medium">
                Введите детали (если необходимо)
              </div>

              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={3}
                    placeholder="Например: В руке — стакан кофе"
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
            <Button
              type="submit"
              disabled={isBusy}
              className="mt-8 px-6 min-w-[200px] text-nowrap"
            >
              {isSubmitting || isFetching
                ? "Загрузка…"
                : `Сгенерировать за ${standardPrice} ${declOfNum(
                    standardPrice,
                    ["токен", "токена", "токенов"]
                  )}`}
            </Button>
          </div>
        </form>
      </GlassCard>
    </>
  );
}
