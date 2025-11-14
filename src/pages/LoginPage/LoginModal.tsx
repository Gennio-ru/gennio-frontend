"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@/api/categories";

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
  const [isFetching, setIsFetching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

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

  // Загружаем категорию при редактировании или сбрасываем форму при создании
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    abortRef.current = controller;

    // если есть id — редактирование
    if (categoryId) {
      (async () => {
        try {
          setIsFetching(true);
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
    } else {
      // если ID нет — очищаем форму
      reset({
        name: "",
        description: "",
      });
    }

    return () => {
      controller.abort();
    };
  }, [open, categoryId, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      let saved: Category;

      if (categoryId) {
        // обновление
        saved = await apiUpdateCategory(categoryId, values);
      } else {
        // создание
        saved = await apiCreateCategory(values);
      }

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

        <DialogFooter className="pt-3">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Отмена
          </Button>
          <Button type="submit" form="category-form" disabled={isBusy}>
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
