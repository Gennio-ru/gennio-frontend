import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import Loader from "@/shared/ui/Loader";

const schema = z.object({
  title: z.string().min(1, "Укажите заголовок"),
  description: z.string().min(1, "Укажите описание"),
  categoryId: z.string().min(1, "Выберите категорию"),
  text: z.string().min(1, "Добавьте текст промпта"),
  afterImageId: z.string().min(1, "Загрузите изображение"),
});

type FormValues = z.infer<typeof schema>;
type UploadResponse = { id?: string };

export default function PromptEditForm() {
  const navigate = useNavigate();
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
      afterImageId: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

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
        const data = await apiGetPrompt(promptId);
        setCurrentPrompt(data);
      } else {
        const { id } = await apiCreatePrompt(dto);
        navigate(`/admin/prompts/${id}`);
      }
      toast.success("Сохранено!");
    } catch (e) {
      toast.error(`Не удалось сохранить промпт. ${e.message}`);
    }
  };

  const isBusy = isFetching || isSubmitting;

  if (isFetching) {
    return <Loader size="lg" />;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-2xl space-y-6 rounded-2xl bg-base-100 p-6 text-base-content"
    >
      <h1 className="text-lg font-semibold">
        {promptId ? "Редактировать промпт" : "Создать промпт"}
      </h1>

      {/* Заголовок */}
      <div className="relative mb-6">
        <label className="mb-1 block text-sm text-base-content/70">
          Заголовок
        </label>

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
              errored={!!errors.title}
              errorMessage={errors.title?.message}
            />
          )}
        />
      </div>

      {/* Описание */}
      <div className="relative mb-6">
        <label className="mb-1 block text-sm text-base-content/70">
          Описание
        </label>

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
              errored={!!errors.description}
              errorMessage={errors.description?.message}
            />
          )}
        />
      </div>

      {/* Категория */}
      <div className="relative mb-6">
        <label className="mb-1 block text-sm text-base-content/70">
          Категория
        </label>

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
          <p className="absolute top-full mt-1 text-xs text-error">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Текст промпта */}
      <div className="relative mb-6">
        <label className="mb-1 block text-sm text-base-content/70">
          Текст промпта
        </label>

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
          <p className="absolute top-full mt-1 text-xs text-error">
            {errors.text.message}
          </p>
        )}
      </div>

      {/* Изображениe */}
      <div className="relative mb-6">
        <ImageUploader
          control={control}
          name="afterImageId"
          label="Изображение"
          disabled={isBusy}
          onUpload={async (file: File) => {
            const id = await upload(file);
            clearErrors("afterImageId");
            return id;
          }}
          currentUrl={currentPrompt?.afterImageUrl ?? null}
        />
        {errors.afterImageId && (
          <p className="absolute top-full mt-1 text-xs text-error">
            {errors.afterImageId.message}
          </p>
        )}
      </div>

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
