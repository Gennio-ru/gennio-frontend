import { apiAIUploadFile } from "@/api/modules/files";
import { apiStartImageEditByPromptText } from "@/api/modules/model-job";
import { setPaymentModalOpen } from "@/features/app/appSlice";
import { setAuthModalOpen, setUser } from "@/features/auth/authSlice";
import { useAuth } from "@/features/auth/useAuth";
import { customToast } from "@/lib/customToast";
import { checkApiResponseErrorCode, isErrorResponseDto } from "@/lib/helpers";
import { route } from "@/shared/config/routes";
import Button from "@/shared/ui/Button";
import GlassCard from "@/shared/ui/GlassCard";
import { ImageUploadWithCrop } from "@/shared/ui/ImageUploadWithCrop";
import Textarea from "@/shared/ui/Textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import z from "zod";

const modelJobSchema = z.object({
  text: z.string().min(1, "Добавьте текст промпта"),
  inputFileId: z.string().min(1, "Загрузите изображение"),
});

type ModelJobFormValues = z.infer<typeof modelJobSchema>;

export default function EditImageByCustomPromptPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);

  const { isAuth } = useAuth();

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

  const inputFileId = useWatch({ control, name: "inputFileId" });

  console.log(inputFileId);

  const onSubmit = async (data: ModelJobFormValues) => {
    try {
      setIsFetching(true);
      const res = await apiStartImageEditByPromptText({
        ...data,
        model: "OPENAI",
      });
      dispatch(setUser(res.user));
      navigate(route.jobWait(res));
    } catch (e) {
      if (checkApiResponseErrorCode(e, "TOKENS_NOT_ENOUGH")) {
        dispatch(setPaymentModalOpen(true));
        return;
      }

      customToast.error(e);
    } finally {
      setIsFetching(false);
    }
  };

  const isBusy = isFetching || isSubmitting;

  return (
    <GlassCard className="mx-auto w-full max-w-2xl mt-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-7 text-base-content"
      >
        <h2 className="text-xl font-bold">Загрузка фото</h2>
        {/* Референс */}
        <div className="relative mb-12">
          <Controller
            name="inputFileId"
            control={control}
            render={({ field }) => (
              <ImageUploadWithCrop
                onUpload={async (file) => {
                  clearErrors("inputFileId");

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
                    if (isErrorResponseDto(e?.response?.data)) {
                      customToast.error(e);
                    }
                  }
                }}
                onRemove={() => field.onChange("")}
              />
            )}
          />

          {errors.inputFileId && (
            <p className="absolute top-full mt-1 text-xs text-error">
              {errors.inputFileId.message}
            </p>
          )}
        </div>

        {/* Промпт */}
        {inputFileId && (
          <div className="relative mb-8">
            <div className="mb-3 text-base">Введите текст промпта</div>

            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  rows={1}
                  placeholder="Например: “сделай в стиле акварели, но сохрани композицию”"
                  className="w-full rounded-field"
                  onChange={(e) => {
                    field.onChange(e);
                    clearErrors("text");
                  }}
                  errored={!!errors.text}
                  errorMessage={errors.text?.message}
                  maxLength={200}
                />
              )}
            />
          </div>
        )}

        {/* Кнопка */}
        <div className="pt-4 flex justify-center">
          {isAuth && (
            <Button type="submit" disabled={isBusy} className="px-6 w-[200px]">
              {isSubmitting ? "Загрузка..." : "Сгенерировать"}
            </Button>
          )}

          {!isAuth && (
            <Button
              type="button"
              className="px-6 w-[200px]"
              onClick={() => dispatch(setAuthModalOpen(true))}
            >
              Войти в аккаунт
            </Button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
