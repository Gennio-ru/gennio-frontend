import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  apiCreatePrompt,
  apiGetPrompt,
  apiUpdatePrompt,
  type Prompt,
  type CreatePromptPayload,
} from "@/api/prompts";
import { apiUploadFile } from "@/api/files";
import Input from "@/shared/Input";
import Textarea from "@/shared/Textarea";
import Button from "@/shared/Button";
import ImageUploader from "@/shared/FilePondUploader";

const promptSchema = z.object({
  title: z.string().min(1, "Укажите заголовок"),
  description: z.string().min(1, "Укажите описание"),
  text: z.string().min(1, "Добавьте текст промпта"),
  beforeImageId: z.string().min(1, "Загрузите изображение «До»"),
  afterImageId: z.string().min(1, "Загрузите изображение «После»"),
});

type PromptFormValues = z.infer<typeof promptSchema>;

type UploadResponse = { id?: string; key?: string };

function getErrorMessage(e: unknown, fallback = "Произошла ошибка"): string {
  if (
    typeof e === "object" &&
    e !== null &&
    "response" in e &&
    typeof (e as any).response?.data?.message === "string"
  ) {
    return (e as any).response.data.message as string;
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

export default function PromptAdminEdit() {
  const [currentPromptData, setCurrentPromptData] = useState<Prompt | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const { id: promptId } = useParams<{ id: string }>();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromptFormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: "",
      description: "",
      text: "",
      beforeImageId: "",
      afterImageId: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!promptId) return;
      try {
        setIsFetching(true);
        const prompt: Prompt = await apiGetPrompt(promptId);
        if (ignore) return;

        setCurrentPromptData(prompt);

        reset({
          title: prompt.title ?? "",
          description: (prompt.description ?? "").trim(),
          text: prompt.text ?? "",
          beforeImageId: (prompt.beforeImageId ?? "").toString(),
          afterImageId: (prompt.afterImageId ?? "").toString(),
        });
      } catch (e) {
        if (!ignore)
          setFormError(getErrorMessage(e, "Не удалось загрузить промпт"));
      } finally {
        if (!ignore) setIsFetching(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [promptId, reset]);

  const upload = async (file: File) => {
    const res = (await apiUploadFile(file)) as UploadResponse;
    const value = res.id;
    if (!value) throw new Error("Сервер не вернул id файла");
    return value;
  };

  const onSubmit = async (data: PromptFormValues) => {
    setFormError(null);
    const dto: CreatePromptPayload = {
      title: data.title,
      description: data.description,
      text: data.text,
      beforeImageId: data.beforeImageId,
      afterImageId: data.afterImageId,
    };

    try {
      if (promptId) {
        await apiUpdatePrompt(promptId, dto);
      } else {
        await apiCreatePrompt(dto);
      }
      reset(data);
      toast.success("Сохранено!");
    } catch (e) {
      setFormError(getErrorMessage(e, "Не удалось сохранить промпт"));
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold">Редактирование промпта</h1>

      {formError && (
        <div className="rounded bg-red-50 text-red-800 px-3 py-2 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <label className="block">
          <div className="mb-1 text-sm text-neutral-600">Заголовок</div>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Название"
                aria-invalid={!!errors.title}
              />
            )}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
          )}
        </label>

        <label className="block">
          <div className="mb-1 text-sm text-neutral-600">Описание</div>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Краткое описание"
                aria-invalid={!!errors.description}
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </label>

        <label className="block">
          <div className="mb-1 text-sm text-neutral-600">Текст промпта</div>
          <Controller
            control={control}
            name="text"
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Текст промпта для модели"
                rows={6}
                aria-invalid={!!errors.text}
              />
            )}
          />
          {errors.text && (
            <p className="mt-1 text-xs text-red-600">{errors.text.message}</p>
          )}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ImageUploader
            control={control}
            name="beforeImageId"
            label="До"
            disabled={isBusy}
            onUpload={upload}
            currentUrl={currentPromptData?.beforeImageUrl ?? null}
          />
          <ImageUploader
            control={control}
            name="afterImageId"
            label="После"
            disabled={isBusy}
            onUpload={upload}
            currentUrl={currentPromptData?.afterImageUrl ?? null}
          />
        </div>

        <Button type="submit" disabled={isBusy}>
          {isSubmitting
            ? "Сохранение..."
            : isFetching
            ? "Загрузка..."
            : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}
