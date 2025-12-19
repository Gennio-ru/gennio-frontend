import { apiAIUploadFile } from "@/api/modules/files";
import { apiStartAdminGenerate, ModelType } from "@/api/modules/model-job";
import { setUser } from "@/features/auth/authSlice";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode } from "@/lib/helpers";
import { route } from "@/shared/config/routes";
import { AspectRatioSegmentedControl } from "@/shared/ui/AspectRatioSegmentedControl";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import { SegmentedControl } from "@/shared/ui/SegmentedControl";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
  inputFileIds: z.array(z.string()).min(1, "Загрузите изображение"),
  aspectRatio: z.string().nullable(),
  imageSize: z.string().nullable(),
  model: z.enum(ModelType),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function AdminAIGeneratePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: {
      text: "",
      inputFileIds: [],
      aspectRatio: null,
      imageSize: null,
      model: ModelType.OPENAI,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartAdminGenerate({
        ...data,
        aspectRatio: data.aspectRatio || undefined,
        imageSize: data.aspectRatio || undefined,
        type:
          data.inputFileIds.length > 0
            ? "image-edit-by-prompt-text"
            : "image-generate-by-prompt-text",
      });
      dispatch(setUser(res.user));
      navigate(route.jobWait(res));
    } catch (e) {
      customToast.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <>
      <GlassCard className="w-full max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-7 text-base-content"
        >
          {/* Модель */}
          <div className="relative mb-0 flex flex-col items-start gap-2">
            <div className="text-lg font-medium">Модель</div>

            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <SegmentedControl<ModelType>
                  {...field}
                  items={[
                    { id: ModelType.OPENAI, label: "OpenAI" },
                    { id: ModelType.GEMINI, label: "Google Gemini" },
                  ]}
                  size="xs"
                  variant="surface"
                />
              )}
            />
          </div>

          <h2 className="mt-4 mb-4 text-lg font-medium">Загрузка фото</h2>
          {/* Референс */}
          <div className="relative mb-0">
            <Controller
              name="inputFileIds"
              control={control}
              render={({ field }) => (
                <ImageUploadWithCrop
                  onChange={(value) => {
                    if (value === null) {
                      field.onChange("");
                    }
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

            {errors.inputFileIds && (
              <p className="absolute top-full mt-1 text-xs text-error">
                {errors.inputFileIds.message}
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
                  placeholder="Например: “сделай в стиле акварели, но сохрани композицию”"
                  className="w-full rounded-field bg-base-100/60"
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors("text");
                  }}
                  errored={!!errors.text}
                  errorMessage={errors.text?.message}
                  maxLength={2000}
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
            <Button
              type="submit"
              disabled={isBusy}
              className="mt-12 px-6 w-[200px]"
            >
              {isSubmitting ? "Загрузка..." : "Сгенерировать"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </>
  );
}
