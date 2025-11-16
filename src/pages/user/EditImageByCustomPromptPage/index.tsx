import { apiUploadFile } from "@/api/files";
import { apiStartImageEditByPromptText } from "@/api/model-job";
import { setUser } from "@/features/auth/authSlice";
import { customToast } from "@/lib/customToast";
import Button from "@/shared/ui/Button";
import ImageUploader from "@/shared/ui/FilePondUploader";
import GlassCard from "@/shared/ui/GlassCard";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
  inputFileId: z.string().min(1, "Загрузите изображение"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;
type UploadResponse = { id?: string; key?: string };

export default function EditImageByCustomPromptPage() {
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
    defaultValues: { text: "", inputFileId: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const upload = async (file: File | null) => {
    clearErrors("inputFileId");
    if (!file) return "";

    const res = (await apiUploadFile(file)) as UploadResponse;

    if (!res.id) {
      return null;
    }

    return res.id;
  };

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptText({
        ...data,
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

  return (
    <GlassCard className="mx-auto w-full max-w-xl mt-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 text-base-content"
      >
        {/* Референс */}
        <div className="relative mb-8">
          <ImageUploader
            control={control}
            name="inputFileId"
            onUpload={upload}
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
                placeholder="Введите текст промпта"
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
            {isSubmitting ? "Обработка…" : "Обработать"}
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}
