import { apiStartTextGenerate } from "@/api/model-job";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
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

export default function GenerateTextPage() {
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
      const res = await apiStartTextGenerate({
        ...data,
        model: "OPENAI",
      });
      navigate(`/model-job/${res.id}`);
    } catch (e) {
      toast.error(e?.message || "Не удалось создать задачу");
    } finally {
      setIsFetching(false);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <GlassCard className="mx-auto max-w-xl">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-box text-base-content"
      >
        {/* Промпт */}
        <div className="relative mb-6">
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="Введите промпт для генерации"
                className="w-full rounded-field"
                maxLength={300}
                errored={!!errors.text}
                errorMessage={errors.text?.message}
                onChange={(e) => {
                  field.onChange(e);
                  clearErrors("text");
                }}
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
