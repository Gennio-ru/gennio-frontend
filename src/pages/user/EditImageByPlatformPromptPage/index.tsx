import { apiUploadFile } from "@/api/files";
import { apiStartImageEditByPromptId } from "@/api/model-job";
import { apiGetPrompt, type Prompt } from "@/api/prompts";
import { setUser } from "@/features/auth/authSlice";
import { customToast } from "@/lib/customToast";
import Button from "@/shared/ui/Button";
import ImageUploader from "@/shared/ui/FilePondUploader";
import GlassCard from "@/shared/ui/GlassCard";
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
type UploadResponse = { id?: string; key?: string };

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

  const upload = async (file: File) => {
    const res = (await apiUploadFile(file)) as UploadResponse;
    if (!res.id) throw new Error("Сервер не вернул id файла");
    return res.id;
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
    <GlassCard className="mx-auto w-full max-w-xl">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-xl space-y-6 text-base-content"
      >
        <h1 className="text-lg font-semibold">{currentPrompt.title}</h1>

        {/* Референс */}
        <div className="relative mb-8">
          <ImageUploader
            control={control}
            name="inputFileId"
            onUpload={async (file) => {
              const id = await upload(file);
              clearErrors("inputFileId");
              return id;
            }}
            disabled={isBusy}
            className="w-full"
          />

          {errors.inputFileId && (
            <p className="absolute top-full mt-1 text-xs text-error">
              {errors.inputFileId.message}
            </p>
          )}
        </div>

        {/* Промпт */}
        <div className="relative mb-8">
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="Введите уточняющий промпт, если необходимо"
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
          <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
            {isSubmitting ? "Обработка…" : isFetching ? "Загрузка…" : "Начать"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
