import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import Input from "@/shared/ui/Input";
import Textarea from "@/shared/ui/Textarea";
import Button from "@/shared/ui/Button";
import ImageUploader from "@/shared/ui/FilePondUploader";
import CategoriesSelect from "@/shared/ui/CategoriesSelect";

import {
  apiCreatePrompt,
  apiGetPrompt,
  apiUpdatePrompt,
  type Prompt,
  type CreatePromptPayload,
} from "@/api/prompts";
import { apiUploadFile } from "@/api/files";

const schema = z.object({
  title: z.string().min(1, "Укажите заголовок"),
  description: z.string().min(1, "Укажите описание"),
  categoryId: z.string().min(1, "Выберите категорию"),
  text: z.string().min(1, "Добавьте текст промпта"),
  beforeImageId: z.string().min(1, "Загрузите изображение «До»"),
  afterImageId: z.string().min(1, "Загрузите изображение «После»"),
});

type FormValues = z.infer<typeof schema>;
type UploadResponse = { id?: string };

export default function PromptEditForm() {
  const { id: promptId } = useParams<{ id: string }>();
  const [isFetching, setIsFetching] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      text: "",
      beforeImageId: "",
      afterImageId: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Загрузка данных промпта
  useEffect(() => {
    if (!promptId) return;

    const controller = new AbortController();

    (async () => {
      try {
        setIsFetching(true);
        const data = await apiGetPrompt(promptId);
        if (controller.signal.aborted) return;

        setCurrentPrompt(data);
        reset({
          title: data.title ?? "",
          description: data.description ?? "",
          categoryId: data.categoryId,
          text: data.text ?? "",
          beforeImageId: data.beforeImageId ?? "",
          afterImageId: data.afterImageId ?? "",
        });
      } catch (e) {
        if (!controller.signal.aborted) {
          toast.error(`Не удалось загрузить промпт. ${e.message}`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsFetching(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [promptId, reset]);

  const upload = async (file: File) => {
    const res = (await apiUploadFile(file)) as UploadResponse;
    if (!res.id) throw new Error("Сервер не вернул id файла");
    return res.id;
  };

  const onSubmit = async (data: FormValues) => {
    const dto: CreatePromptPayload = { ...data };

    try {
      if (promptId) {
        await apiUpdatePrompt(promptId, dto);
      } else {
        await apiCreatePrompt(dto);
      }
      const data = await apiGetPrompt(promptId);
      setCurrentPrompt(data);
      toast.success("Сохранено!");
    } catch (e) {
      toast.error(`Не удалось сохранить промпт. ${e.message}`);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-2xl space-y-5 rounded-2xl bg-base-100 p-6 text-base-content"
    >
      <h1 className="text-lg font-semibold">
        {promptId ? "Редактировать промпт" : "Создать промпт"}
      </h1>

      {/* Заголовок */}
      <div className="space-y-1">
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Название"
              onChange={(e) => {
                field.onChange(e);
                clearErrors("title");
              }}
            />
          )}
        />
        {errors.title && (
          <p className="text-xs text-error">{errors.title.message}</p>
        )}
      </div>

      {/* Описание */}
      <div className="space-y-1">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Краткое описание"
              rows={3}
              onChange={(e) => {
                field.onChange(e);
                clearErrors("description");
              }}
            />
          )}
        />
        {errors.description && (
          <p className="text-xs text-error">{errors.description.message}</p>
        )}
      </div>

      {/* Категория */}
      <div className="space-y-1">
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <CategoriesSelect
              value={field.value || null}
              onChange={(v) => {
                field.onChange(v);
                clearErrors("categoryId");
              }}
            />
          )}
        />
        {errors.categoryId && (
          <p className="text-xs text-error">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Текст промпта */}
      <div className="space-y-1">
        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Текст промпта для модели"
              rows={6}
              onChange={(e) => {
                field.onChange(e);
                clearErrors("text");
              }}
            />
          )}
        />
        {errors.text && (
          <p className="text-xs text-error">{errors.text.message}</p>
        )}
      </div>

      {/* Изображения */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUploader
          control={control}
          name="beforeImageId"
          label="До"
          disabled={isBusy}
          onUpload={upload}
          currentUrl={currentPrompt?.beforeImageUrl ?? null}
        />
        <ImageUploader
          control={control}
          name="afterImageId"
          label="После"
          disabled={isBusy}
          onUpload={upload}
          currentUrl={currentPrompt?.afterImageUrl ?? null}
        />
      </div>
      {errors.beforeImageId && (
        <p className="text-xs text-error">{errors.beforeImageId.message}</p>
      )}
      {errors.afterImageId && (
        <p className="text-xs text-error">{errors.afterImageId.message}</p>
      )}

      {/* Кнопка */}
      <div className="pt-4">
        <Button disabled={isBusy}>
          {isSubmitting
            ? "Сохранение…"
            : isFetching
            ? "Загрузка…"
            : "Сохранить"}
        </Button>
      </div>
    </form>
  );
}
