import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/shared/ui/Button";
import z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  apiCreatePrompt,
  apiGetPrompt,
  apiUpdatePrompt,
  CreatePromptPayload,
  Prompt,
} from "@/api/modules/prompts";
import toast from "react-hot-toast";
import Textarea from "@/shared/ui/Textarea";
import Input from "@/shared/ui/Input";
import CategoriesSelect from "@/shared/ui/CategoriesSelect";
import { apiUploadFile, FileDto } from "@/api/modules/files";
import { customToast } from "@/lib/customToast";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import { fetchAdminPrompts } from "@/features/admin-prompts/adminPromptSlice";
import { AppRoute, route } from "@/shared/config/routes";

const schema = z.object({
  title: z.string().min(1, "Укажите заголовок"),
  description: z.string().min(1, "Укажите описание"),
  categoryId: z.string().min(1, "Выберите категорию"),
  text: z.string().min(1, "Добавьте текст промпта"),
  beforeImageId: z.string().min(1, "Загрузите изображение"),
  afterImageId: z.string().min(1, "Загрузите изображение"),
});

type FormValues = z.infer<typeof schema>;

export default function AdminPromptEditModal() {
  const dispatch = useAppDispatch();
  const { promptId, "*": wildcard } = useParams();
  const open = Boolean(promptId) || wildcard === "new";
  const navigate = useNavigate();

  const { page } = useAppSelector((s) => s.adminPrompts);

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(false);

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

  useWatch({ control });

  const clearForm = useCallback(
    () =>
      reset({
        title: "",
        description: "",
        categoryId: "",
        text: "",
        beforeImageId: "",
        afterImageId: "",
      }),
    [reset]
  );

  useEffect(() => {
    if (!promptId) {
      setPrompt(null);
      clearForm();
      return;
    }

    setLoading(true);

    apiGetPrompt(promptId)
      .then((data) => {
        setPrompt(data);
        reset({
          title: data.title ?? "",
          description: data.description ?? "",
          categoryId: data.categoryId,
          text: data.text ?? "",
          beforeImageId: data.beforeImageId ?? "",
          afterImageId: data.afterImageId ?? "",
        });
      })
      .catch((e) => {
        customToast.error(e);
      })
      .finally(() => setLoading(false));
  }, [promptId, reset, clearForm]);

  const closeModal = () => {
    navigate(AppRoute.ADMIN_PROMPTS, { replace: true });
    clearForm();
  };

  const onSubmit = async (data: FormValues) => {
    const dto: CreatePromptPayload = { ...data };

    try {
      if (promptId) {
        await apiUpdatePrompt(promptId, dto);
        const data = await apiGetPrompt(promptId);
        setPrompt(data);
      } else {
        const { id } = await apiCreatePrompt(dto);
        navigate(route.adminPrompt(id));
      }
      toast.success("Сохранено!");

      dispatch(fetchAdminPrompts({ page, limit: 50 }));
    } catch (e) {
      toast.error(`Не удалось сохранить промпт. ${e.message}`);
    }
  };

  const isBusy = loading || isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeModal();
      }}
    >
      <DialogContent
        className={cn("sm:max-w-xl flex flex-col max-h-[94%] overflow-y-auto")}
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-3 shrink-0">
          <DialogTitle className="text-center text-lg">
            {promptId ? "Редактировать промпт" : "Создать промпт"}
          </DialogTitle>

          <DialogClose
            className="absolute cursor-pointer top-0 right-0 focus:outline-none focus:ring-0"
            onClick={closeModal}
          >
            <XIcon size={22} />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto w-full space-y-6 text-base-content"
        >
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
              key={promptId ?? "new"}
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CategoriesSelect
                  value={field.value || null}
                  onChange={(v) => {
                    field.onChange(v);
                    clearErrors("categoryId");
                  }}
                  color="secondary"
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

          {/* Изображениe до */}
          <div className="relative mb-6">
            <label className="mb-1 block text-sm text-base-content/70">
              До
            </label>

            <Controller
              name="beforeImageId"
              control={control}
              render={({ field }) => (
                <ImageUploadWithCrop
                  value={
                    field.value && prompt?.beforeImageUrl
                      ? ({
                          id: field.value,
                          url: prompt.beforeImageUrl,
                        } as FileDto)
                      : null
                  }
                  onChange={(file) => {
                    // в форму кладём только id
                    field.onChange(file?.id ?? "");
                    clearErrors("beforeImageId");
                  }}
                  onUpload={async (file) => {
                    clearErrors("beforeImageId");

                    if (!file) {
                      throw new Error("Файл не передан");
                    }

                    const res = await apiUploadFile(file);

                    if (!res || !res.id || !res.url) {
                      throw new Error("Не удалось загрузить файл");
                    }

                    field.onChange(res.id);
                    setPrompt({ ...prompt, beforeImageUrl: res.url });
                    return res;
                  }}
                />
              )}
            />
            {errors.beforeImageId && (
              <p className="absolute top-full mt-1 text-xs text-error">
                {errors.beforeImageId.message}
              </p>
            )}
          </div>

          {/* Изображениe после */}
          <div className="relative mb-6">
            <label className="mb-1 block text-sm text-base-content/70">
              После
            </label>

            <Controller
              name="afterImageId"
              control={control}
              render={({ field }) => (
                <ImageUploadWithCrop
                  value={
                    field.value && prompt?.afterImageUrl
                      ? ({
                          id: field.value,
                          url: prompt.afterImageUrl,
                        } as FileDto)
                      : null
                  }
                  onChange={(file) => {
                    // в форму кладём только id
                    field.onChange(file?.id ?? "");
                    clearErrors("afterImageId");
                  }}
                  onUpload={async (file) => {
                    clearErrors("afterImageId");

                    if (!file) {
                      throw new Error("Файл не передан");
                    }

                    const res = await apiUploadFile(file);

                    if (!res || !res.id || !res.url) {
                      throw new Error("Не удалось загрузить файл");
                    }

                    field.onChange(res.id);
                    setPrompt({ ...prompt, afterImageUrl: res.url });
                    return res;
                  }}
                />
              )}
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
                : loading
                ? "Загрузка…"
                : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
