import { apiStartImageGenerateByPromptText } from "@/api/model-job";
import Button from "@/shared/ui/Button";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function EditImageByCustomPromptPage() {
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm<ModelJobFormValues>({
    resolver: zodResolver(modelJobSchema),
    defaultValues: { text: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageGenerateByPromptText({
        ...data,
        model: "OPENAI",
      });
      navigate(`/model-job/${res.id}`);
      toast.success("Задача запущена!");
    } catch (e) {
      toast.error(e?.message || "Не удалось создать задачу");
    } finally {
      setIsFetching(false);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-xl space-y-6 rounded-box bg-base-100 p-6 text-base-content"
    >
      {/* Промпт */}
      <div className="relative mb-6">
        <label className="mb-1 block text-sm text-base-content/70">
          Промпт
        </label>

        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              rows={4}
              placeholder="Введите промпт для генерации"
              className="w-full rounded-field p-2"
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

      {/* Кнопка */}
      <div className="pt-4 flex justify-center">
        <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
          {isSubmitting ? "Обработка…" : isFetching ? "Загрузка…" : "Начать"}
        </Button>
      </div>
    </form>
  );
}
