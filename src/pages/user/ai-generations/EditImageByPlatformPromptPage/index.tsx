import { apiUploadFile, UploadFileResponse } from "@/api/modules/files";
import { apiStartImageEditByPromptId } from "@/api/modules/model-job";
import { apiGetPrompt, type Prompt } from "@/api/modules/prompts";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setUser } from "@/features/auth/authSlice";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import Loader from "@/shared/ui/Loader";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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

  useEffect(() => {
    if (!promptId) return;
    setIsLoading(true);
    apiGetPrompt(promptId)
      .then((res) => {
        setCurrentPrompt(res);
      })
      .finally(() => setIsLoading(false));
  }, [promptId]);

  const upload = async (file: File | null): Promise<UploadFileResponse> => {
    clearErrors("inputFileId");

    if (!file) {
      throw new Error("Файл не передан");
    }

    // делаем реальный запрос
    const res = await apiUploadFile(file);

    if (!res || !res.id || !res.url) {
      throw new Error("Не удалось загрузить файл");
    }

    return res;
  };

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptId({
        ...data,
        promptId,
        text: data.text || null,
        model: "OPENAI",
      });
      dispatch(setUser(res.user));
      navigate(`/model-job/${res.id}`);
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
    <GlassCard className="mx-auto w-full max-w-xl mt-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-xl space-y-6 text-base-content"
      >
        <h1 className="text-lg font-semibold">{currentPrompt.title}</h1>

        {/* Референс */}
        <div className="relative mb-8">
          <ImageUploadWithCrop onUpload={upload} />

          {errors.inputFileId && (
            <p className="absolute top-full mt-1 text-xs text-error">
              {errors.inputFileId.message}
            </p>
          )}
        </div>

        {/* Промпт */}
        <div className="relative mb-8">
          <div className="mb-3 text-base">Введите детали (если необходимо)</div>

          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={1}
                placeholder="Например: Добавь красный колпак на голову"
                className="w-full rounded-field"
                onChange={(e) => {
                  field.onChange(e);
                  clearErrors("text");
                }}
                errored={!!errors.text}
                errorMessage={errors.text?.message}
                maxLength={200}
              />
            )}
          />
        </div>

        {/* Кнопка */}
        <div className="pt-4 flex justify-center">
          <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
            {isSubmitting
              ? "Загрузка…"
              : isFetching
              ? "Загрузка…"
              : "Сгенерировать"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
