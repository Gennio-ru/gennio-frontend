import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/dialog";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import Textarea from "@/shared/ui/Textarea";
import {
  apiGetCategory,
  apiCreateCategory,
  apiUpdateCategory,
  type Category,
} from "@/api/modules/categories";
import { fetchCategories } from "@/features/app/appSlice";
import { useAppDispatch } from "@/app/hooks";
import Loader from "@/shared/ui/Loader";

const schema = z.object({
  name: z.string().min(1, "Укажите название категории"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId?: string | null;
  onSaved?: (category: Category) => void;
};

export default function EditCategoryModal({
  open,
  onOpenChange,
  categoryId,
  onSaved,
}: Props) {
  const dispatch = useAppDispatch();
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (!open) return;

    if (categoryId) {
      setIsFetching(true);
      reset({
        name: "",
        description: "",
      });

      const controller = new AbortController();

      (async () => {
        try {
          const data = await apiGetCategory(categoryId);

          if (controller.signal.aborted) return;

          reset({
            name: data.name ?? "",
            description: data.description ?? "",
          });
        } catch (e: unknown) {
          if (!controller.signal.aborted) {
            const message =
              e instanceof Error ? e.message : "Неизвестная ошибка";
            toast.error(`Не удалось загрузить категорию. ${message}`);
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
    }

    // если ID нет — создаём новую категорию, просто очищаем форму
    reset({
      name: "",
      description: "",
    });
    setIsFetching(false);
  }, [open, categoryId, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      let saved: Category;

      if (categoryId) {
        saved = await apiUpdateCategory(categoryId, values);
      } else {
        saved = await apiCreateCategory(values);
      }

      // обновляем список категорий в слайсе
      dispatch(fetchCategories());
      toast.success("Сохранено!");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Неизвестная ошибка";
      toast.error(`Не удалось сохранить категорию. ${message}`);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? "Редактировать категорию" : "Создать категорию"}
          </DialogTitle>
          <DialogDescription>
            {categoryId
              ? "Измените поля и нажмите «Сохранить»"
              : "Заполните поля новой категории"}
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex min-h-[140px] items-center justify-center py-4">
            <Loader />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 py-2"
            id="category-form"
          >
            {/* Название */}
            <div className="relative">
              <label className="mb-1 block text-sm text-muted-foreground">
                Название
              </label>

              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Например, «Пейзажи»"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("name");
                    }}
                    disabled={isBusy}
                    autoFocus
                    errored={!!errors.name}
                    errorMessage={errors.name?.message}
                  />
                )}
              />
            </div>

            {/* Описание */}
            <div className="relative">
              <label className="mb-1 block text-sm text-muted-foreground">
                Описание <span className="opacity-50">(необязательно)</span>
              </label>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Краткое описание категории"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrors("description");
                    }}
                    disabled={isBusy}
                    errored={!!errors.description}
                    errorMessage={errors.description?.message}
                  />
                )}
              />
            </div>
          </form>
        )}

        <DialogFooter className="pt-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            form="category-form"
            disabled={isBusy || isFetching}
          >
            {isSubmitting
              ? "Сохранение…"
              : isFetching
              ? "Загрузка…"
              : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
